# GhostWriter AI

**Stories from the other side.** GhostWriter AI is a horror-fiction generator built with React, Vite, Netlify Functions, and the Gemini Developer API.

## Features

- Generate horror stories from a prompt.
- Choose Supernatural, Psychological, Cosmic, Gothic, and Tech Horror.
- Select short, medium, or long output.
- Continue a story with a follow-up generation.
- Copy or download generated stories.
- Responsive dark interface with API status.
- The Gemini API key stays in Netlify's server-side environment and is never shipped to the browser.

## Architecture

`React + Vite (Netlify static site)` → `Netlify Functions` → `Gemini Developer API`

The production frontend and backend functions deploy together on Netlify. The Python/Flask backend under `backend/` is legacy local-development code; the Netlify functions under `frontend/netlify/functions/` are used by the deployed website.

## Deploy both frontend and backend on Netlify

The root `netlify.toml` configures:
- Base directory: `frontend`
- Build command: `npm run build`
- Publish directory: `dist`
- Functions directory: `netlify/functions` (relative to the base directory)

### 1. Set the Gemini API key securely

1. Open your Netlify project dashboard.
2. Go to **Project configuration → Environment variables**.
3. Add `GEMINI_API_KEY` and paste the secret key from [Google AI Studio](https://aistudio.google.com/apikey).
4. Optionally add `GEMINI_MODEL` to override the default `gemini-3.5-flash-lite` model. Use a model available to your Google AI Studio API key.
5. Ensure the key is available to Functions at runtime. Do not add it to `netlify.toml`, frontend source, or any `VITE_*` variable.
6. Trigger a new deploy after setting the variable.

### 2. Deploy

Pushes to `main` trigger Netlify builds if Git integration is enabled. A successful deploy should publish the static site and the serverless functions together.

### 3. Verify

- Health endpoint: `https://YOUR-SITE.netlify.app/.netlify/functions/health`
- Story endpoint: `POST https://YOUR-SITE.netlify.app/.netlify/functions/story`

The health endpoint returns `status: "ok"` when the key is configured; it does not verify model access or quota. Then test generation from the website itself.

## Local development

Requirements: Node.js 20+ recommended, and a Gemini API key.

From the repository root, in PowerShell:

```powershell
cd frontend
npm install
$env:GEMINI_API_KEY = "paste-your-key-here"
npx netlify dev
```

Open the local URL shown by Netlify CLI. Keep the key only in your local shell or a private environment file excluded from Git. For a plain Vite-only preview, the Netlify Functions will not run.

## Security and limitations

- Store `GEMINI_API_KEY` only in Netlify environment variables for server-side Functions.
- Never expose the Gemini key in frontend JavaScript, GitHub, screenshots, or logs.
- Restrict and monitor the key in Google AI Studio where available.
- The Gemini API free tier has model-specific quotas and terms; free usage is limited and not guaranteed to be unlimited or suitable for all commercial workloads.
- Public serverless endpoints can be abused. This demo validates inputs but does not yet include a robust persistent rate limiter; monitor API usage and add stronger abuse controls before wide public sharing.
- Do not submit sensitive personal data to story prompts. Review Google's current Gemini API data-use terms.

## License

This project source is released under the MIT License. Gemini models and API access are governed by Google's applicable terms.
