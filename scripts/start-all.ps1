# Start Next.js dev server (SQLite backend, no Docker)
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

if (-not (Test-Path ".env.local")) {
  Write-Host ".env.local not found. Run .\scripts\setup.ps1 first." -ForegroundColor Yellow
  exit 1
}

New-Item -ItemType Directory -Force -Path "data", "public\uploads" | Out-Null

$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue |
  Select-Object -ExpandProperty OwningProcess -Unique |
  Where-Object { $_ -gt 0 }
foreach ($procId in $port3000) {
  Write-Host "Stopping existing process on port 3000 (PID $procId)..."
  Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
}

$lanIp = (
  Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
    Where-Object {
      $_.IPAddress -notlike "127.*" -and
      $_.IPAddress -notlike "169.254.*" -and
      $_.PrefixOrigin -ne "WellKnown"
    } |
    Select-Object -First 1 -ExpandProperty IPAddress
)

Write-Host ""
Write-Host "Starting Next.js..." -ForegroundColor Cyan
Write-Host "  PC:     http://localhost:3000" -ForegroundColor Green
if ($lanIp) {
  Write-Host "  Mobile: http://${lanIp}:3000/login" -ForegroundColor Green
  $env:ALLOWED_DEV_ORIGINS = $lanIp
} else {
  Write-Host "  Mobile: use your PC Wi-Fi IP from ipconfig (not localhost)" -ForegroundColor Yellow
}
Write-Host "  Database: .\data\poc3.db"
Write-Host ""
npm run dev:clean
