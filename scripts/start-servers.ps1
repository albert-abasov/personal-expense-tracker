# scripts/start-servers.ps1
# Starts backend and frontend as detached processes, writes PIDs to .server-pids
# Run from repo root.

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot

# --- Backend ---
Write-Host "Starting backend (Gradle bootRun)..." -ForegroundColor Cyan
$backend = Start-Process -FilePath "powershell" `
    -ArgumentList "-Command", "& '$root\gradlew' bootRun" `
    -WorkingDirectory $root `
    -PassThru `
    -WindowStyle Hidden

# --- Frontend ---
Write-Host "Starting frontend (npm run dev)..." -ForegroundColor Cyan
$frontend = Start-Process -FilePath "powershell" `
    -ArgumentList "-Command", "npm run dev" `
    -WorkingDirectory "$root\frontend" `
    -PassThru `
    -WindowStyle Hidden
# Save PIDs so stop-servers.ps1 can kill them
"$($backend.Id)`n$($frontend.Id)" | Set-Content "$root\.server-pids"

Write-Host "Backend PID:  $($backend.Id)" -ForegroundColor Gray
Write-Host "Frontend PID: $($frontend.Id)" -ForegroundColor Gray
Write-Host "PIDs saved to .server-pids" -ForegroundColor Gray
