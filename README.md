# GhostWriter AI

**Stories from the other side.** GhostWriter AI is a horror-fiction generator built with React, Flask, and the Gemini Developer API.

## Features

- Generate horror stories from a prompt.
- Choose Supernatural, Psychological, Cosmic, Gothic, and Tech Horror.
- Select short, medium, or long output.
- Continue a story with a follow-up generation.
- Copy or download generated stories.
- Responsive dark interface with API status.
- API key stays on the backend; it is never bundled into the frontend.

## Architecture

`React + Vite (Netlify)` → `Flask API (Render)` → `Gemini Developer API`

Prompts are sent from the backend to Google Gemini to generate a story. Do not enter sensitive or private information into prompts. Review Google's current Gemini API terms and data-use rules before using this for sensitive or commercial workloads.

## Deploy the frontend on Netlify

The repository includes `netlify.toml` with the Vite base and publish settings.

In Netlify, open **Project configuration → Environment variables** and add:

- Key: `VITE_API_BASE_URL`
- Value: the public Render backend URL, for example `https://your-service-name.onrender.com` (no trailing slash)

Trigger a new frontend deploy after setting the variable.

## Deploy the backend on Render (free tier for demos)

The repository includes `render.yaml` to configure a Python web service from the `backend` directory.

1. Sign in to [Render](https://render.com/) and choose **New → Blueprint**.
2. Connect this GitHub repository and approve access if asked.
3. Review the service created from `render.yaml`.
4. In the service's **Environment** settings, add `GEMINI_API_KEY` with your secret key from [Google AI Studio](https://aistudio.google.com/apikey). Never commit the key to GitHub or put it in a `VITE_*` variable.
5. Set `FRONTEND_ORIGIN` to `https://ghostwriterai-hectoberfect.netlify.app`.
6. Save and deploy. Copy the service's public `onrender.com` URL.
7. Add that URL to Netlify as `VITE_API_BASE_URL` and redeploy the frontend.

Render free services can spin down after inactivity, so the first request after a quiet period may take around a minute. Free plans and Gemini API quotas can change; check the current provider dashboards before a demo.

## Local development

Requirements: Python 3.10+, Node.js 20+ recommended, and a Gemini API key.

### Backend (PowerShell)

From the repository root:

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
$env:GEMINI_API_KEY = "paste-your-key-here"
$env:FRONTEND_ORIGIN = "http://127.0.0.1:5173"
.\.venv\Scripts\python.exe app.py
```

Keep the key only in your local shell or a private environment file that is excluded from Git.

### Frontend

Open a second terminal from the repository root:

```powershell
cd frontend
npm install
$env:VITE_API_BASE_URL = "http://127.0.0.1:5000"
npm run dev
```

Open `http://127.0.0.1:5173`.

## API endpoints

- `GET /api/health` — confirms the backend has a configured API key.
- `POST /api/story` — accepts `prompt`, `genre`, `length`, and optional `previous_story`.

The API validates inputs and applies a small in-memory per-IP request limit for demo protection. This is not a substitute for a persistent rate limiter or abuse protection for a larger public launch.

## Security and limitations

- Keep `GEMINI_API_KEY` only in Render's backend environment variables or a local secret environment.
- Never expose the Gemini key in frontend JavaScript, GitHub, screenshots, or logs.
- Restrict and monitor the key in Google AI Studio where available.
- The free Gemini API tier has model-specific quotas and terms; a free tier is not a guarantee of unlimited or commercial usage.
- Render free web services may sleep when idle and have resource limits.
- CORS restricts browser origins but does not prevent direct API calls; the in-memory request limiter is basic demo protection.
- Do not submit sensitive personal data to prompts.

## License

This project source is released under the MIT License. The Gemini API and models are governed by Google's applicable terms.
