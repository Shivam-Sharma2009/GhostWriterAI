import os
import time
from collections import defaultdict, deque

import requests
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 64 * 1024

FRONTEND_ORIGIN = os.getenv(
    "FRONTEND_ORIGIN",
    "https://ghostwriterai-hectoberfect.netlify.app",
).rstrip("/")
LOCAL_ORIGINS = ["http://localhost:5173", "http://127.0.0.1:5173"]
CORS(
    app,
    resources={r"/api/*": {"origins": LOCAL_ORIGINS + [FRONTEND_ORIGIN]}},
    methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
MODEL = os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite")
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent"

GENRE_OPTIONS = {"Supernatural", "Psychological", "Cosmic", "Gothic", "Tech Horror"}
LENGTH_OPTIONS = {
    "Short": ("about 200 words", 450),
    "Medium": ("about 500 words", 900),
    "Long": ("about 800 words", 1400),
}
SYSTEM_PROMPT = """
You are GhostWriter, a creative horror-fiction writer.
Write original, atmospheric fiction with suspense, vivid settings, strong pacing,
and memorable endings. Respect the requested genre and approximate length.
Give the story a short title. The story is fictional; do not claim it describes
real events. Avoid graphic gore. Return only the title and story.
""".strip()

# Small in-memory guard for public demo abuse. For a larger launch, use a shared
# rate limiter/WAF because this counter resets when the free service restarts.
REQUESTS_PER_WINDOW = 10
RATE_WINDOW_SECONDS = 600
request_times = defaultdict(deque)


def rate_limited(client_ip):
    now = time.time()
    recent = request_times[client_ip]
    while recent and now - recent[0] > RATE_WINDOW_SECONDS:
        recent.popleft()
    if len(recent) >= REQUESTS_PER_WINDOW:
        return True
    recent.append(now)
    return False


@app.get("/api/health")
def health():
    if not GEMINI_API_KEY:
        return jsonify({
            "status": "api_key_missing",
            "provider": "Gemini",
            "message": "The server administrator must configure GEMINI_API_KEY.",
        }), 503
    return jsonify({"status": "ok", "provider": "Gemini", "model": MODEL}), 200


@app.post("/api/story")
def generate_story():
    if not GEMINI_API_KEY:
        return jsonify({"error": "Story generation is not configured yet. Please try again later."}), 503

    if rate_limited(request.remote_addr or "unknown"):
        return jsonify({"error": "Too many story requests. Please wait a few minutes and try again."}), 429

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
            GEMINI_URL,
            headers={
                "x-goog-api-key": GEMINI_API_KEY,
                "Content-Type": "application/json",
            },
            json={
                "systemInstruction": {
                    "parts": [{"text": SYSTEM_PROMPT}]
                },
                "contents": [{
                    "role": "user",
                    "parts": [{"text": user_message}],
                }],
                "generationConfig": {
                    "temperature": 0.9,
                    "maxOutputTokens": max_tokens,
                },
            },
            timeout=90,
        )
        if response.status_code == 429:
            return jsonify({"error": "The AI service is busy or its free-tier limit was reached. Please try again later."}), 429
        if response.status_code in (401, 403):
            app.logger.error("Gemini rejected the configured API key (HTTP %s).", response.status_code)
            return jsonify({"error": "The AI service key is invalid or does not have access. Please contact the site owner."}), 502
        response.raise_for_status()
        payload = response.json()
        candidates = payload.get("candidates", [])
        parts = candidates[0].get("content", {}).get("parts", []) if candidates else []
        story = "\n".join(part.get("text", "") for part in parts if part.get("text")).strip()
        if not story:
            return jsonify({"error": "Gemini returned no story. Please try a different prompt."}), 502
        return jsonify({"story": story, "model": MODEL})
    except requests.Timeout:
        return jsonify({"error": "Story generation timed out. Try a shorter story."}), 504
    except requests.RequestException as exc:
        app.logger.warning("Gemini request failed: %s", exc.__class__.__name__)
        return jsonify({"error": "Could not reach the AI service. Please try again shortly."}), 503


@app.errorhandler(413)
def request_too_large(_error):
    return jsonify({"error": "The request is too large. Shorten the story or prompt and try again."}), 413


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "10000")), debug=False)
