---
name: budgettracker-playwright
description: >
  Use this skill whenever the user asks to run Playwright tests, e2e tests, integration tests,
  or UI tests for BudgetTracker. Trigger on phrases like "run the tests", "run playwright",
  "test the app", "e2e tests", "check if the UI works", "run the test suite", or any mention
  of automated browser testing. This skill owns the full server lifecycle: starting backend and
  frontend, waiting for readiness, running tests, and guaranteed cleanup — always read it before
  touching any server process or Playwright command.
---

# BudgetTracker — Playwright E2E Testing

This skill manages the full test lifecycle on Windows:
start servers → wait for ready → run Playwright → kill servers (always, even on failure).

Servers: backend on `:8080` (`./gradlew bootRun`), frontend on `:3000` (`npm run dev`).

---

## Step 1 — Pre-flight: free the ports

Before starting anything, ensure ports are clean:

```powershell
powershell -Command "
  foreach ($port in @(8080, 3000)) {
    \$conn = Get-NetTCPConnection -LocalPort \$port -ErrorAction SilentlyContinue
    if (\$conn) {
      Stop-Process -Id \$conn.OwningProcess -Force -ErrorAction SilentlyContinue
      Write-Host \"Freed port \$port\"
    }
  }
"
```

---

## Step 2 — Start servers as detached background processes

Use the helper script so PIDs are captured reliably. Run from the repo root:

```bash
powershell -ExecutionPolicy Bypass -File scripts/start-servers.ps1
```

This script writes PIDs to `.server-pids` in the repo root and returns immediately.
See `scripts/start-servers.ps1` for the implementation.

---

## Step 3 — Wait for both servers to be ready

Poll with `curl` until both respond or timeout (60 s each):

```bash
powershell -ExecutionPolicy Bypass -File scripts/wait-for-servers.ps1
```

If either server fails to become ready within the timeout, run Step 5 (cleanup) immediately
and report the failure — do not proceed to running tests.

---

## Step 4 — Run Playwright

```bash
npx playwright test
```

Common useful flags:
```bash
npx playwright test --reporter=line          # compact output
npx playwright test tests/transactions.spec.ts  # single spec file
npx playwright test --headed                 # show browser (debug)
npx playwright test --debug                  # pause on each step
```

Capture the exit code — you need it after cleanup to report pass/fail correctly.

---

## Step 5 — Kill servers (ALWAYS run this, even if tests failed)

```bash
powershell -ExecutionPolicy Bypass -File scripts/stop-servers.ps1
```

This reads PIDs from `.server-pids` and kills them, then deletes the file.
Never skip this step regardless of what happened in Steps 3 or 4.

---

## Full sequence (copy-paste when executing)

```bash
# 1. Free ports
powershell -ExecutionPolicy Bypass -Command "foreach (\$p in @(8080,3000)) { \$c = Get-NetTCPConnection -LocalPort \$p -EA SilentlyContinue; if (\$c) { Stop-Process -Id \$c.OwningProcess -Force } }"

# 2. Start servers
powershell -ExecutionPolicy Bypass -File scripts/start-servers.ps1

# 3. Wait for ready
powershell -ExecutionPolicy Bypass -File scripts/wait-for-servers.ps1

# 4. Run tests
npx playwright test

# 5. Stop servers (always)
powershell -ExecutionPolicy Bypass -File scripts/stop-servers.ps1
```

---

## Reporting results

After cleanup, summarise:
- How many tests passed / failed / skipped
- Which spec files had failures (if any)
- Paste the first failure message if there is one
- Note whether servers started and stopped cleanly

---

## Scripts

See `scripts/` directory:
- `start-servers.ps1` — launches backend + frontend, writes `.server-pids`
- `wait-for-servers.ps1` — polls `:8080` and `:3000` until ready or timeout
- `stop-servers.ps1` — kills by PID from `.server-pids`, cleans up file