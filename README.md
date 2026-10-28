# GhostWriter AI

**Stories from the other side.** GhostWriter AI is a local-first horror-fiction generator powered by Google's open-weight Gemma model through Ollama.

## Features

- Generate horror stories from a prompt.
- Choose from Supernatural, Psychological, Cosmic, Gothic, and Tech Horror.
- Select short, medium, or long output.
- Continue a story with a follow-up generation.
- Copy or download generated stories.
- Dark, responsive React interface with local model status.
- Flask API validates requests and connects to Ollama on the same machine.

## Architecture

`React + Vite` → `Flask API` → `Ollama local API` → `Gemma`

Prompts are sent to the local Ollama service, not a hosted AI inference API. The initial Ollama/model download needs internet access. After installation, generation can work offline, provided the local model and dependencies are already available.

## Requirements

- Windows, macOS, or Linux
- Python 3.10+
- Node.js 20+ recommended
- [Ollama](https://ollama.com/download)
- Enough RAM for the selected model. The default `gemma3:1b` is intended as a lightweight starting point; speed and quality depend on your machine.

## 1. Install and pull Gemma

Install Ollama, then run:

```powershell
ollama pull gemma3:1b
ollama run gemma3:1b
```

Try a prompt to confirm that the model responds, then type `/bye` to exit. Keep Ollama running in the background.

## 2. Start the backend

In PowerShell, from the repository root:

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe app.py
```

The API listens on `http://127.0.0.1:5000`.

Check it from another terminal:

```powershell
Invoke-RestMethod http://127.0.0.1:5000/api/health
```

Expected status: `ok`. If the status is `model_missing`, confirm the model name using `ollama list`. If Ollama is unavailable, start Ollama first.

## 3. Start the frontend

Open a second terminal from the repository root:

```powershell
cd frontend
npm install
npm run dev
```

Open `http://127.0.0.1:5173`.

## Test a story request

```powershell
$body = @{
  prompt = "A student receives a message from a computer that has been unplugged for years"
  genre = "Tech Horror"
  length = "Short"
} | ConvertTo-Json

Invoke-RestMethod -Uri http://127.0.0.1:5000/api/story `
  -Method Post -ContentType "application/json" -Body $body
```

## Production build check

```powershell
cd frontend
npm run build
```

The static frontend build alone is not a publicly hosted AI service. A public deployment would also need a securely reachable backend and model runtime. Do not expose the Ollama API or Flask development server directly to the public internet.

## Troubleshooting

- **`ollama` is not recognized:** finish the Ollama installation and reopen PowerShell.
- **Model missing:** run `ollama pull gemma3:1b` and check `ollama list`.
- **Backend offline in the UI:** start `backend/app.py` and reload the page.
- **Generation is slow:** use `Short`, close memory-heavy applications, and wait for the first model load.
- **Port already in use:** stop the other process or change the port consistently in the frontend and backend.

## Open innovation

Gemma is open-weight, which lets developers run inference on their own hardware and experiment with local workflows. This project demonstrates local inference and keeps prompts on the user's machine during generation. Model weights and their terms are supplied by the model publisher; review the applicable Gemma terms before redistribution or commercial use.

## Challenge context

Built for the Hacktoberfest Open-Source AI Challenge Week 4 theme, **Ghost in the Machine**. The story concept uses a machine as the source of eerie, fictional narratives.

## Limitations

- Small models may produce inconsistent plots or repeat details.
- Local generation speed depends on available RAM, CPU/GPU support, and model loading.
- The frontend currently targets a local backend at `127.0.0.1:5000`.
- Google Fonts are loaded from the internet; system fonts can be substituted for a fully offline visual experience.

## License

This project source is released under the MIT License. The Gemma model is distributed separately and is not included in this repository.
