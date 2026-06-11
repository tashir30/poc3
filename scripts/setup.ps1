# poc3 setup - Windows, no Docker
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

Write-Host "Installing npm dependencies..."
npm install

New-Item -ItemType Directory -Force -Path "data", "public\uploads" | Out-Null

if (-not (Test-Path ".env.local")) {
  $secret = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object { [char]$_ })
  $envContent = "SESSION_SECRET=$secret`nNEXT_PUBLIC_APP_URL=http://localhost:3000`nDATABASE_PATH=./data/poc3.db`n"
  Set-Content -Path ".env.local" -Value $envContent -Encoding UTF8
  Write-Host "Created .env.local with a random SESSION_SECRET"
} else {
  Write-Host ".env.local already exists - keeping it"
}

Write-Host ""
Write-Host "Setup complete. Run: .\scripts\start-all.ps1" -ForegroundColor Green
Write-Host "No Docker required - data is stored in .\data\poc3.db" -ForegroundColor Green
