# scripts/wait-for-servers.ps1
# Polls backend (:8080) and frontend (:3000) until both respond or timeout expires.
# Exits with code 0 on success, 1 on timeout.

$timeoutSeconds = 120
$intervalSeconds = 3

$targets = @(
    @{ Name = "Backend";  Url = "http://localhost:8080/api/v1/me"; AcceptCodes = @(200, 401) },
    @{ Name = "Frontend"; Url = "http://localhost:3000";           AcceptCodes = @(200) }
)

$ready = @{}
$deadline = (Get-Date).AddSeconds($timeoutSeconds)

Write-Host "Waiting for servers (timeout: ${timeoutSeconds}s)..." -ForegroundColor Cyan

while ((Get-Date) -lt $deadline) {
    foreach ($target in $targets) {
        if ($ready[$target.Name]) { continue }

        try {
            $response = Invoke-WebRequest -Uri $target.Url `
                -UseBasicParsing `
                -TimeoutSec 3 `
                -ErrorAction Stop

            if ($target.AcceptCodes -contains $response.StatusCode) {
                Write-Host "  ✓ $($target.Name) is ready (HTTP $($response.StatusCode))" -ForegroundColor Green
                $ready[$target.Name] = $true
            }
        } catch {
            # Not ready yet — swallow and retry
        }
    }

    if ($ready.Count -eq $targets.Count) {
        Write-Host "Both servers ready." -ForegroundColor Green
        exit 0
    }

    $pending = $targets | Where-Object { -not $ready[$_.Name] } | ForEach-Object { $_.Name }
    Write-Host "  Waiting for: $($pending -join ', ')..." -ForegroundColor Gray
    Start-Sleep -Seconds $intervalSeconds
}

Write-Host "TIMEOUT: servers did not become ready within ${timeoutSeconds}s." -ForegroundColor Red
$pending = $targets | Where-Object { -not $ready[$_.Name] } | ForEach-Object { $_.Name }
Write-Host "Still not ready: $($pending -join ', ')" -ForegroundColor Red
exit 1
