import os
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(
    app,
    resources={r"/api/*": {"origins": [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]}},
)

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434")
MODEL = os.getenv("GHOSTWRITER_MODEL", "gemma3:1b")
GENRE_OPTIONS = {"Supernatural", "Psychological", "Cosmic", "Gothic", "Tech Horror"}
LENGTH_OPTIONS = {
    "Short": ("about 200 words", 400),
    "Medium": ("about 500 words", 850),
    "Long": ("about 800 words", 1200),
}
SYSTEM_PROMPT = """
You are GhostWriter, a creative horror-fiction writer.
Write original, atmospheric fiction with suspense, vivid settings, strong pacing,
and memorable endings. Respect the requested genre and approximate length.
Give the story a short title. The story is fictional; do not claim it describes
real events. Avoid graphic gore. Return only the title and story.
""".strip()


@app.get("/api/health")
def health():
    try:
        response = requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=5)
        response.raise_for_status()
        models = response.json().get("models", [])
        installed = any(
            m.get("name", "").split(":")[0] == MODEL.split(":")[0]
            and m.get("name", "") == MODEL
            for m in models
        )
        return jsonify({
            "status": "ok" if installed else "model_missing",
            "model": MODEL,
            "ollama": "reachable",
        }), 200
    except requests.RequestException:
        return jsonify({
            "status": "ollama_unavailable",
            "model": MODEL,
            "message": "Start Ollama and ensure its local API is available.",
        }), 503


@app.post("/api/story")
def generate_story():
    data = request.get_json(silent=True) or {}
    prompt = str(data.get("prompt", "")).strip()
    genre = str(data.get("genre", "Supernatural")).strip()
    length = str(data.get("length", "Short")).strip()
    previous_story = str(data.get("previous_story", "")).strip()

    if not prompt:
        return jsonify({"error": "Enter a story idea first."}), 400
    if len(prompt) > 1000:
        return jsonify({"error": "Keep your prompt under 1,000 characters."}), 400
    if genre not in GENRE_OPTIONS:
        return jsonify({"error": "Choose a valid horror style."}), 400
    if length not in LENGTH_OPTIONS:
        return jsonify({"error": "Choose a valid story length."}), 400
    if len(previous_story) > 12000:
        return jsonify({"error": "The existing story is too long to continue."}), 400

    length_description, max_tokens = LENGTH_OPTIONS[length]
    if previous_story:
        user_message = (
            f"Continue this {genre} horror story with {length_description} of NEW "
            "material. Preserve continuity, introduce a meaningful development, "
            "and do not repeat the existing text.\n\n"
            f"Original idea: {prompt}\n\nExisting story:\n{previous_story}"
        )
    else:
        user_message = (
            f"Write a {genre} horror story of {length_description}.\n"
            f"Story idea: {prompt}"
        )

    try:
        response = requests.post(
            f"{OLLAMA_BASE_URL}/api/chat",
            json={
                "model": MODEL,
                "stream": False,
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_message},
                ],
                "options": {"temperature": 0.9, "num_predict": max_tokens},
            },
            timeout=300,
        )
        response.raise_for_status()
        payload = response.json()
        story = payload.get("message", {}).get("content", "").strip()
        if not story:
            return jsonify({"error": "Gemma returned an empty response. Try again."}), 502
        return jsonify({"story": story, "model": MODEL})
    except requests.Timeout:
        return jsonify({"error": "Generation timed out. Try a shorter story."}), 504
    except requests.RequestException:
        return jsonify({
            "error": "Could not reach Gemma. Check that Ollama is running and the model is installed."
        }), 503


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=False)
