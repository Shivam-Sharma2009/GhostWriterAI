$ErrorActionPreference = "Stop"
Set-Location "$PSScriptRoot\frontend"

if (-not (Test-Path "node_modules")) {
    npm install
}

Write-Host "Starting GhostWriter AI frontend at http://127.0.0.1:5173"
npm run dev
