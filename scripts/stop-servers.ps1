# scripts/stop-servers.ps1
# Kills backend and frontend using PIDs saved by start-servers.ps1.
# Always runs cleanup even if a kill fails — never throws.

$root = Split-Path -Parent $PSScriptRoot
$pidFile = "$root\.server-pids"

if (-not (Test-Path $pidFile)) {
    Write-Host "No .server-pids file found — nothing to kill." -ForegroundColor Gray
    exit 0
}

$pids = Get-Content $pidFile | Where-Object { $_ -match '^\d+$' }
$labels = @("Backend", "Frontend")

for ($i = 0; $i -lt $pids.Count; $i++) {
    $procId = [int]$pids[$i]
    $label  = if ($i -lt $labels.Count) { $labels[$i] } else { "Process $i" }

    try {
        $proc = Get-Process -Id $procId -ErrorAction SilentlyContinue
        if ($proc) {
            # Kill the process and all its children (Gradle spawns child JVMs)
            $children = Get-CimInstance Win32_Process |
                    Where-Object { $_.ParentProcessId -eq $procId }
            foreach ($child in $children) {
                Stop-Process -Id $child.ProcessId -Force -ErrorAction SilentlyContinue
            }
            Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
            Write-Host "✓ Stopped $label (PID $procId)" -ForegroundColor Green
        } else {
            Write-Host "  $label (PID $procId) was already gone" -ForegroundColor Gray
        }
    } catch {
        Write-Host "  Could not kill $label (PID $procId): $_" -ForegroundColor Yellow
    }
}

# Also sweep for any lingering java/node on the target ports, just in case
foreach ($port in @(8080, 3000)) {
    $conn = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($conn) {
        Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
        Write-Host "  Freed leftover process on port $port" -ForegroundColor Yellow
    }
}

Remove-Item $pidFile -Force -ErrorAction SilentlyContinue
Write-Host "Cleanup complete." -ForegroundColor Green
