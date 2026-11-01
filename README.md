# 👻 GhostWriter AI

> **Stories from the other side.**  
> Turn one unsettling idea into an atmospheric horror story.

<p align="center">
  <a href="https://ghostwriterai-hectoberfect.netlify.app/">
    <strong>🌐 Open the live app</strong>
  </a>
  &nbsp;·&nbsp;
  <a href="https://github.com/Shivam-Sharma2009/GhostWriterAI">
    <strong>View source code</strong>
  </a>
</p>

GhostWriter AI is a browser-based horror-fiction generator. Give it a story seed, choose a horror style and length, and let Google's Gemini model turn the idea into an original narrative. You can continue a generated story, copy it, or download it as a text file.

The interface pairs a haunted-library atmosphere with a responsive writing workspace, drifting particle effects, and a pumpkin-inspired theme switch.

---

## Contents

- [Features](#features)
- [Screens and experience](#screens-and-experience)
- [How it works](#how-it-works)
- [Technology stack](#technology-stack)
- [Repository structure](#repository-structure)
- [Run locally](#run-locally)
- [Deploy to Netlify](#deploy-to-netlify)
- [API reference](#api-reference)
- [Verification checklist](#verification-checklist)
- [Security and limitations](#security-and-limitations)
- [Roadmap](#roadmap)
- [License](#license)

## Features

### AI storytelling
- **Prompt-led generation:** start with a premise, character, location, message, or strange event.
- **Five horror styles:** Supernatural, Psychological, Cosmic, Gothic, and Tech Horror.
- **Three length presets:** Short, Medium, and Long.
- **Continue the story:** request new material while carrying forward the existing story as context.
- **Original narrative output:** the server prompt guides the model toward suspense, atmosphere, escalation, and a memorable unsettling ending.

### Writing tools
- **Copy:** copy the generated manuscript to the clipboard.
- **Download:** save the story as a `.txt` file.
- **Prompt counter:** see the character count while writing a story seed.
- **Feedback states:** clear loading, success, and error messages.

### Interface
- **Dark and light themes:** use the pumpkin control in the top-left corner. An unlit pumpkin indicates dark mode; a glowing pumpkin indicates light mode.
- **Theme persistence:** the selected theme is saved in browser storage when available.
- **Live footer clock:** displays the current India time (IST) and date, updating every second.
- **Responsive layout:** adapts to desktop and mobile screens, with normal page scrolling.
- **Atmospheric presentation:** haunted-library background, translucent panels, and subtle drifting particles.
- **Reduced-motion support:** animations are reduced when the operating system requests less motion.

## Screens and experience

1. Open the app and enter a story seed in **Story Seed**.
2. Select one of the five horror styles.
3. Choose Short, Medium, or Long.
4. Select **Generate Story** and read the manuscript.
5. Use **Continue the Story** to request additional material.
6. Copy or download the finished story.

The app is a creative writing tool. Generated stories are fictional and should be reviewed and edited by the user.

## How it works

The production application uses a React/Vite frontend and Netlify Functions as a server-side bridge to the Gemini Developer API.

```text
┌───────────────────────────────┐
│          User browser         │
│      React + Vite UI          │
│  Prompt · Genre · Length      │
└───────────────┬───────────────┘
                │ POST JSON
                ▼
┌───────────────────────────────┐
│       Netlify Functions       │
│  Validate input and context   │
│  Read server-side API key     │
└───────────────┬───────────────┘
                │ HTTPS request
                ▼
┌───────────────────────────────┐
│      Gemini Developer API    │
│       Text generation         │
└───────────────┬───────────────┘
                │ Generated story
                ▼
┌───────────────────────────────┐
│       Manuscript panel        │
│   Read · Continue · Copy      │
│            Download           │
└───────────────────────────────┘
```

The browser sends the prompt, genre, length, and optional previous story to the `story` function. The function validates the request, constructs genre-specific instructions, calls Gemini, and returns the generated text as JSON.

The `health` function reports whether the server-side API key is configured. It is a configuration check, not a live model or quota test.

> **Deployment note:** The active production path is `frontend/netlify/functions/`. The repository also contains an older Flask/Ollama backend under `backend/`; it is retained as legacy/local-development code and is not the backend used by the current Netlify deployment.

## Technology stack

| Area | Technology |
|---|---|
| UI | React 18 |
| Build tooling | Vite 6 |
| Language | JavaScript (ES modules) |
| Styling | CSS |
| Icons | Lucide React |
| Serverless API | Netlify Functions |
| AI provider | Google Gemini Developer API |
| Default model | `gemini-3.5-flash-lite` (overridable with `GEMINI_MODEL`) |
| Hosting | Netlify |
| Version control | Git and GitHub |

## Repository structure

```text
GhostWriterAI/
├── frontend/
│   ├── netlify/
│   │   └── functions/
│   │       ├── health.mjs       # Configuration health check
│   │       └── story.mjs        # Validates prompts and calls Gemini
│   ├── src/
│   │   ├── App.jsx              # Main writing experience
│   │   ├── App.css              # Themes, layout, and visual effects
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── backend/                     # Legacy Flask/Ollama implementation
├── netlify.toml                 # Netlify build and function configuration
├── run-backend.ps1              # Legacy backend helper
├── run-frontend.ps1             # Legacy frontend helper
├── LICENSE
└── README.md
```

## Run locally

### Prerequisites

- Node.js (LTS recommended) and npm
- A Google Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)
- Netlify CLI to run the frontend and serverless functions together

### 1. Clone the repository

```bash
git clone https://github.com/Shivam-Sharma2009/GhostWriterAI.git
cd GhostWriterAI
```

### 2. Install frontend dependencies

```bash
cd frontend
npm install
```

### 3. Configure the API key

In PowerShell, set the key for the current terminal session:

```powershell
$env:GEMINI_API_KEY = "your-gemini-api-key"
```

Optionally choose a model available to your Google AI Studio project:

```powershell
$env:GEMINI_MODEL = "gemini-3.5-flash-lite"
```

Do not commit API keys. If you use a local `.env` file, keep it out of Git and ensure it is loaded by your local tooling.

### 4. Start the application

From the `frontend/` directory:

```bash
npx netlify dev
```

Open the local URL printed by Netlify CLI. Running only `npm run dev` starts Vite but does not, by itself, provide the Netlify Functions used by the production app.

## Deploy to Netlify

The root `netlify.toml` contains the deployment configuration. The expected settings are:

| Setting | Value |
|---|---|
| Base directory | `frontend` |
| Build command | `npm run build` |
| Publish directory | `dist` |
| Functions directory | `netlify/functions` (relative to the base directory) |

1. Import `Shivam-Sharma2009/GhostWriterAI` into Netlify.
2. Confirm the build settings above.
3. In the Netlify site's environment variables, add `GEMINI_API_KEY` as a secret.
4. Optionally set `GEMINI_MODEL` to a model enabled for the API key. If omitted, the function uses `gemini-3.5-flash-lite`.
5. Ensure the variables are available to Functions at runtime.
6. Trigger a deployment and test the deployed site.

**Live app:** https://ghostwriterai-hectoberfect.netlify.app/

If Netlify pauses production deployments because the team has exhausted its operational credits, the last successful published deployment may remain available, but new GitHub commits will not appear on the live site until deployments resume.

## API reference

### `POST /.netlify/functions/story`

Generates a new story or continues an existing one.

**Request body**

```json
{
  "prompt": "A student receives a message from a computer that has been unplugged for ten years.",
  "genre": "Tech Horror",
  "length": "Short",
  "previous_story": ""
}
```

| Field | Required | Accepted values / limit |
|---|---|---|
| `prompt` | Yes | Non-empty string, up to 1,000 characters |
| `genre` | No | `Supernatural`, `Psychological`, `Cosmic`, `Gothic`, `Tech Horror` |
| `length` | No | `Short`, `Medium`, `Long` |
| `previous_story` | No | Existing story text, up to 12,000 characters |

**Success response**

```json
{
  "story": "The generated title and story...",
  "model": "gemini-3.5-flash-lite"
}
```

The returned `model` reflects the configured model for that request. Error responses contain an `error` message. The function also handles common missing-key, invalid-input, quota/rate-limit, model-availability, provider, and timeout failures.

### `GET /.netlify/functions/health`

Returns the provider name, configured model, and whether `GEMINI_API_KEY` is present.

Example response:

```json
{
  "status": "ok",
  "provider": "Gemini",
  "model": "gemini-3.5-flash-lite",
  "note": "This confirms the key is configured; it does not test Gemini API availability or quota."
}
```

A successful health response does not guarantee that a story request will succeed. Test the generation endpoint itself.

## Verification checklist

After a local run or deployment, check the following:

- [ ] Homepage loads without a browser console error.
- [ ] Empty prompts are rejected with a useful message.
- [ ] All five horror styles can be selected.
- [ ] Short, Medium, and Long requests are accepted.
- [ ] A new story is returned and displayed.
- [ ] Continue Story adds new material without replacing the existing manuscript.
- [ ] Copy places the story on the clipboard.
- [ ] Download saves a plain-text story file.
- [ ] Pumpkin control switches between dark and light themes.
- [ ] Theme preference persists after refresh when browser storage is available.
- [ ] Footer clock displays India time and date and updates.
- [ ] Layout remains usable on narrow screens.
- [ ] Health endpoint reports configuration and a real story request succeeds.

## Security and limitations

- Keep `GEMINI_API_KEY` in server-side environment variables only. Never put it in frontend source, a `VITE_*` variable, screenshots, or committed files.
- The server validates prompt length, genre, story length, and previous-story size before calling the provider.
- The public story endpoint does not currently implement a robust persistent rate limiter. Add stronger abuse controls before exposing the service to high-volume traffic.
- API availability, model access, quotas, and pricing are controlled by Google and can change. Free usage is limited and is not guaranteed to be unlimited.
- Generated text can be inconsistent or contain mistakes. Review and edit output before publishing.
- Avoid entering confidential or sensitive personal information into prompts.
- The background photograph is loaded from an external image host and may not display if that host is unavailable.
- The live app depends on Netlify Functions and the Gemini API; a static frontend preview alone cannot provide story generation.

## Roadmap

Potential next improvements:

- [ ] Optional saved-story library with user-controlled storage
- [ ] More genre and tone controls
- [ ] Export formats beyond plain text
- [ ] Stronger request throttling and abuse protection
- [ ] Automated tests for serverless function validation and error handling
- [ ] Accessibility review and additional keyboard-navigation checks

## License

This project is released under the [MIT License](LICENSE).

The Gemini API and model are provided by Google and remain subject to Google's applicable terms, availability, and usage policies.
