$ErrorActionPreference = "Stop"
Set-Location "$PSScriptRoot\backend"

if (-not (Test-Path ".venv\Scripts\python.exe")) {
    py -m venv .venv
    .\.venv\Scripts\python.exe -m pip install -r requirements.txt
}

Write-Host "Starting GhostWriter AI backend at http://127.0.0.1:5000"
.\.venv\Scripts\python.exe app.py
