export default async () => {
  const configured = Boolean(process.env.GEMINI_API_KEY);
  return new Response(JSON.stringify({
    status: configured ? "ok" : "api_key_missing",
    provider: "Gemini",
    model: process.env.GEMINI_MODEL || "gemini-3.5-flash-lite"
  }), {
    status: configured ? 200 : 503,
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
};
