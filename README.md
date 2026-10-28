# 👻 GhostWriter AI

> **Stories from the other side.**  
> Turn a story seed into an atmospheric horror tale with AI.

**Live app:** https://ghostwriterai-hectoberfect.netlify.app/  
**Source code:** https://github.com/Shivam-Sharma2009/GhostWriterAI

GhostWriter AI is a responsive horror-story generator built with React, Vite, Netlify Functions, and Google's Gemini Developer API. It features a haunted-library visual theme, floating particles, and a Halloween pumpkin control that switches between dark and light modes.

---

## ✨ Features

- **Prompt-led story generation** — start with a premise, character, setting, or unsettling event.
- **Five horror styles** — Supernatural, Psychological, Cosmic, Gothic, and Tech Horror.
- **Three story lengths** — Short, Medium, and Long.
- **Continue the story** — ask the AI to extend the current story while preserving continuity.
- **Copy and download** — copy the manuscript or download it as a plain-text file.
- **Halloween theme switch** — click the circular pumpkin in the upper-left:
  - Pumpkin unlit = dark mode.
  - Pumpkin glowing = light mode.
- **Saved theme preference** — the selected theme persists in the browser.
- **Responsive layout and natural page scrolling** — works across desktop and mobile screen sizes.
- **Atmospheric visuals** — horror-themed background, translucent panels, and drifting particle effects, with reduced-motion support.
- **Server-side AI requests** — the Gemini API key stays in Netlify environment variables and is not included in frontend JavaScript.

## 🧰 Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | React, Vite, JavaScript, CSS |
| Icons | Lucide React |
| Serverless backend | Netlify Functions (ES modules) |
| AI provider | Google Gemini Developer API |
| Hosting | Netlify (frontend and functions) |
| Source control | GitHub |

## 🏗️ Architecture

```text
Browser
  └── React + Vite static frontend
        └── /.netlify/functions/story
              └── Gemini Developer API

        └── /.netlify/functions/health
              └── Reports whether the API key is configured
```

The production frontend and serverless backend deploy together on Netlify. The older `backend/` Flask/Ollama implementation remains in the repository as legacy/local-development code; the live Netlify app uses the functions in `frontend/netlify/functions/`.

## 🚀 Deployment: Netlify

The root `netlify.toml` configures the frontend build and serverless functions:

- **Base directory:** `frontend`
- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Functions directory:** `netlify/functions` (relative to the `frontend` base)

### 1. Configure the Gemini API key

1. Open the [Google AI Studio API key page](https://aistudio.google.com/apikey) and create or select an API key.
2. In Netlify, open **Project configuration → Environment variables**.
3. Add `GEMINI_API_KEY` and mark it as a secret.
4. Optionally add `GEMINI_MODEL` to override the model default configured in `frontend/netlify/functions/story.mjs`. Choose a model available to your API key.
5. Ensure the variable is available to Functions at runtime, then redeploy.

**Never** put the key in frontend source code, GitHub, `netlify.toml`, or a `VITE_*` variable.

### 2. Deploy

Connect the GitHub repository to Netlify and use the build settings above. With Git integration enabled, pushes to `main` trigger a deployment automatically.

### 3. Verify the deployment

Replace the example hostname below with your Netlify site hostname.

- **Health check:** `https://YOUR-SITE.netlify.app/.netlify/functions/health`
- **Story function:** `POST https://YOUR-SITE.netlify.app/.netlify/functions/story`
- **End-to-end check:** open the live website, enter a story seed, select a genre and length, and click **Generate Story**.

The health endpoint checks whether the API key is configured. It does **not** prove that Gemini model access, quota, or story generation is working; test generation in the app as well.

## 💻 Local development

Requirements: Node.js and npm, plus a Gemini API key. Netlify CLI is used to run the frontend and functions together locally.

From the repository root, in PowerShell:

```powershell
cd frontend
npm install
$env:GEMINI_API_KEY = "your-key"
npx netlify dev
```

Open the local URL printed by Netlify CLI. Keep your API key in your local shell or a private environment file excluded from Git. A plain Vite preview does not run Netlify Functions.

## ✅ Release smoke-test checklist

After deployment, verify:

- [ ] The homepage loads without a console error.
- [ ] Generate a new story with each genre at least once.
- [ ] Short, Medium, and Long options submit successfully.
- [ ] Continue Story appends new material and preserves continuity.
- [ ] Copy and Download work.
- [ ] The pumpkin toggles between light and dark modes.
- [ ] The selected theme survives a page refresh.
- [ ] The page scrolls on desktop and mobile.
- [ ] The health endpoint responds, and a real story-generation request succeeds.

## 🔐 Security and limitations

- Keep `GEMINI_API_KEY` in server-side Netlify environment variables only.
- Never publish the API key in source code, screenshots, browser bundles, or logs.
- Monitor API usage and configure available key restrictions in Google AI Studio.
- Gemini API availability, model access, quotas, and terms depend on Google's current policies; free usage is limited and not guaranteed to be unlimited.
- The public story endpoint validates inputs, but this project does not currently implement a robust persistent rate limiter. Add stronger abuse controls before high-traffic public use.
- Avoid sending sensitive personal information in story prompts.
- The background photograph is loaded from an external image host, so its display depends on that host being reachable.

## 📄 License

The project source is released under the MIT License. Gemini models and API access are governed by Google's applicable terms.
