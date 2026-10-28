const GENRES = new Set(["Supernatural", "Psychological", "Cosmic", "Gothic", "Tech Horror"]);
const LENGTHS = {
  Short: ["about 200 words", 450],
  Medium: ["about 500 words", 900],
  Long: ["about 800 words", 1400],
};
const SYSTEM_PROMPT = [
  "You are GhostWriter, a creative horror-fiction writer.",
  "Write original, atmospheric fiction with suspense, vivid settings, strong pacing, and memorable endings.",
  "Respect the requested genre and approximate length. Give the story a short title.",
  "The story is fictional; do not claim it describes real events. Avoid graphic gore.",
  "Return only the title and story."
].join(" ");

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }
  });
}

export default async (request) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed." }, 405);
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return json({ error: "Story generation is not configured yet. Please try again later." }, 503);
  }

  let data;
  try {
    data = await request.json();
  } catch {
    return json({ error: "Send a valid JSON request." }, 400);
  }

  const prompt = String(data.prompt || "").trim();
  const genre = String(data.genre || "Supernatural").trim();
  const length = String(data.length || "Short").trim();
  const previousStory = String(data.previous_story || "").trim();

  if (!prompt) return json({ error: "Enter a story idea first." }, 400);
  if (prompt.length > 1000) return json({ error: "Keep your prompt under 1,000 characters." }, 400);
  if (!GENRES.has(genre)) return json({ error: "Choose a valid horror style." }, 400);
  if (!Object.hasOwn(LENGTHS, length)) return json({ error: "Choose a valid story length." }, 400);
  if (previousStory.length > 12000) return json({ error: "The existing story is too long to continue." }, 400);

  const [lengthDescription, maxTokens] = LENGTHS[length];
  const userMessage = previousStory
    ? `Continue this ${genre} horror story with ${lengthDescription} of NEW material. Preserve continuity, introduce a meaningful development, and do not repeat the existing text.\n\nOriginal idea: ${prompt}\n\nExisting story:\n${previousStory}`
    : `Write a ${genre} horror story of ${lengthDescription}.\nStory idea: ${prompt}`;

  const model = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: "user", parts: [{ text: userMessage }] }],
        generationConfig: { temperature: 0.9, maxOutputTokens: maxTokens }
      }),
      signal: AbortSignal.timeout(85000)
    });

    if (response.status === 429) {
      console.error("Gemini API quota/rate limit reached (429).");
      return json({ error: "Gemini's quota or rate limit was reached. Check Google AI Studio API usage and try again later." }, 429);
    }
    if (response.status === 401 || response.status === 403) {
      console.error("Gemini rejected the configured API key or project permissions (HTTP", response.status, ").");
      return json({ error: "Gemini rejected this API key or project permissions. Check the key in Google AI Studio and ensure the Gemini API is enabled." }, 502);
    }
    if (response.status === 404) {
      console.error("Gemini model was not found or is unavailable:", model);
      return json({ error: `The configured Gemini model (${model}) is unavailable for this API key. In Netlify, set GEMINI_MODEL to gemini-3.5-flash-lite and redeploy.` }, 502);
    }
    if (!response.ok) {
      let providerMessage = "";
      try {
        const errorPayload = await response.json();
        providerMessage = String(errorPayload?.error?.message || "");
      } catch {}
      console.error("Gemini API returned HTTP", response.status, providerMessage.slice(0, 300));
      return json({
        error: providerMessage
          ? `Gemini API error (HTTP ${response.status}): ${providerMessage.slice(0, 220)}`
          : `Gemini API returned HTTP ${response.status}. Check the Netlify function logs and Google AI Studio quota.`
      }, 502);
    }

    const payload = await response.json();
    const parts = payload.candidates?.[0]?.content?.parts || [];
    const story = parts.map(part => part.text || "").join("\n").trim();
    if (!story) return json({ error: "The AI returned an empty story. Try another prompt." }, 502);
    return json({ story, model });
  } catch (error) {
    console.error("Gemini request failed:", error?.name || "UnknownError");
    return json({
      error: error?.name === "TimeoutError" || error?.name === "AbortError"
        ? "Story generation timed out. Try a shorter story."
        : "Could not reach the AI service. Please try again shortly."
    }, 503);
  }
};
