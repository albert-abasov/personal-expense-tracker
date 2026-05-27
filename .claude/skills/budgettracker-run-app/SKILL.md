---
name: budgettracker-run-app
description: >
  Use this skill before running, starting, launching, or testing either the backend or frontend
  of BudgetTracker. Trigger on ANY phrase like "run the app", "start the server", "boot the
  backend", "launch frontend", "npm run dev", "mvn bootRun", "test if it works", "can you start",
  "spin up", or similar. Also trigger if the user reports a port conflict (8080 or 3000 already
  in use) or a zombie process. CRITICAL: never run blocking server commands in a Claude session
  on Windows — always follow this skill's approach instead.
---

# BudgetTracker — Running the App (Windows)

## The Core Rule

**Never run `mvn bootRun` or `npm run dev` as a blocking foreground command in a Claude bash
session.** These processes hang the session indefinitely and cannot be cleanly killed from
within Claude on Windows. Claude should not start servers — the user runs them in their own
terminals.

---

## What Claude Should Do Instead

### If asked to "run" or "start" the app

Tell the user to start the servers themselves in two separate terminals:

```
Terminal 1 — Backend:
  cd <project-root>/backend
  ./mvnw bootRun

Terminal 2 — Frontend:
  cd <project-root>/frontend
  npm run dev
```

Then offer to verify the backend compiled correctly by doing a **build-only check** (no server):

```bash
./mvnw compile -q
```

This catches compilation errors without starting anything.

### If asked to verify an endpoint works

Ask the user to confirm the server is already running, then use a one-shot HTTP call:

```bash
# Check backend health (non-blocking, exits immediately)
curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api/v1/me
```

`curl` exits after the response — it does not hang.

### If asked to run tests

Tests are fine — they do not start a long-lived server:

```bash
# Backend unit/integration tests
./mvnw test

# Or a single test class
./mvnw test -Dtest=TransactionServiceTest
```

---

## Killing Stuck Processes (Windows)

If ports 8080 or 3000 are already occupied, give the user these commands to run in their own
terminal (CMD or PowerShell):

### Find and kill port 8080 (backend)

```cmd
:: Find the PID using port 8080
netstat -ano | findstr :8080

:: Kill it (replace 12345 with the actual PID from above)
taskkill /PID 12345 /F
```

### Find and kill port 3000 (frontend)

```cmd
netstat -ano | findstr :3000
taskkill /PID 12345 /F
```

### One-liner — kill by port directly (PowerShell)

```powershell
# Kill whatever is on port 8080
$pid = (Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue).OwningProcess
if ($pid) { Stop-Process -Id $pid -Force; Write-Host "Killed PID $pid" } else { Write-Host "Port 8080 is free" }

# Kill whatever is on port 3000
$pid = (Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue).OwningProcess
if ($pid) { Stop-Process -Id $pid -Force; Write-Host "Killed PID $pid" } else { Write-Host "Port 3000 is free" }
```

### Kill all Java processes (nuclear option — closes all JVMs)

```cmd
taskkill /IM java.exe /F
```

### Kill all Node processes (nuclear option — closes all Node)

```cmd
taskkill /IM node.exe /F
```

---

## Quick Reference Card

| Situation | What Claude does |
|---|---|
| User asks to "run the app" | Give terminal instructions; don't execute |
| User asks to verify compilation | Run `./mvnw compile -q` |
| User asks to verify an endpoint | One-shot `curl` (server must already be running) |
| User asks to run tests | `./mvnw test` — safe, non-blocking |
| Port already in use | Provide the `netstat` + `taskkill` commands above |
| User reports hung Claude session | Provide nuclear `taskkill` options above |

---

## Why Not Background Processes?

Windows does not support Unix-style `&` backgrounding reliably in Claude's bash environment.
Options like `Start-Process` or `start /B` create detached processes with no handle — Claude
cannot stop them, and they outlive the session. The user ends up with the same zombie problem.
The only safe pattern is: Claude never starts servers; the user owns their terminals.