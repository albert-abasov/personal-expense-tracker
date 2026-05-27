# kill-servers.ps1
# Run this whenever you need to free ports 8080 (backend) and 3000 (frontend)
# Usage: .\kill-servers.ps1

$ports = @(8080, 3000)

foreach ($port in $ports) {
    $conn = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($conn) {
        $procId = $conn.OwningProcess | Select-Object -First 1
        $proc = Get-Process -Id $procId -ErrorAction SilentlyContinue
        $name = if ($proc) { $proc.Name } else { "unknown" }
        Stop-Process -Id $procId -Force
        Write-Host "✓ Killed port $port  (PID $procId  [$name])" -ForegroundColor Green
    } else {
        Write-Host "  Port $port is already free" -ForegroundColor Gray
    }
}
