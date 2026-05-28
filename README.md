# Personal Expense Tracker

A full-stack personal-finance web application for tracking spending across customizable categories, setting monthly budgets, and analyzing expense trends. Uses OAuth 2.0 (Google and GitHub) for authentication.

## Tech Stack

- **Backend:** Java 21, Spring Boot 4.0.6, Spring Security (OAuth2), Spring Data JDBC, Flyway
- **Database:** SQLite 3 (file-based)
- **Frontend:** React 18, TypeScript, TailwindCSS, React Query (TanStack Query v5), Vite
- **Build:** Gradle (backend), npm (frontend)

## Quick Start

### Backend

```bash
./gradlew bootRun
```

Runs on `http://localhost:8080`. SQLite database is auto-created at `./budgettracker.db`.

### Frontend

```bash
cd frontend && npm install && npm run dev
```

Runs on `http://localhost:3000`. Vite proxies `/api/*` and `/oauth2/*` to the backend.

## Environment Setup

Create a `.env` file in the project root:

```env
SPRING_DATASOURCE_URL=jdbc:sqlite:./budgettracker.db
SPRING_DATASOURCE_USERNAME=
SPRING_DATASOURCE_PASSWORD=

SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GOOGLE_CLIENT_ID=your_google_client_id
SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GOOGLE_CLIENT_SECRET=your_google_client_secret

SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GITHUB_CLIENT_ID=your_github_client_id
SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GITHUB_CLIENT_SECRET=your_github_client_secret

APP_BASE_URL=http://localhost:3000
APP_CORS_ALLOWED_ORIGIN=http://localhost:3000
```

## WebSocket Protocol: Budget Alerts

The application uses WebSocket to push real-time budget alerts to authenticated users.

### Connection

**Endpoint:** `ws://localhost:8080/ws/budget-alerts` (or `wss://` in production)

Connection requires an active HTTP session (OAuth2 authentication). Unauthenticated upgrade requests are rejected.

### Client → Server: SUBSCRIBE Message

After the WebSocket connection is established, the client immediately sends a subscription message to request budget evaluation:

```json
{ "type": "SUBSCRIBE" }
```

**Effect on server:** Triggers an immediate evaluation of the current month's budget. Any spending threshold (50%, 80%, or 100% of budget) that has not yet been sent this session is pushed back to the client as a `BUDGET_ALERT`.

### Server → Client: CONNECTED Message

Sent once immediately after successful handshake and authentication:

```json
{ "type": "CONNECTED" }
```

### Server → Client: BUDGET_ALERT Message

Sent when the user's spending crosses a budget threshold (50%, 80%, or 100%), or when triggered by a `SUBSCRIBE` request.

```json
{
  "type": "BUDGET_ALERT",
  "threshold": 80,
  "usagePercent": 82.5,
  "totalSpent": 825.00,
  "budgetAmount": 1000.00,
  "currency": "USD",
  "year": 2026,
  "month": 5
}
```

**Fields:**
- `threshold` — The spending threshold that was crossed: `50`, `80`, or `100` (percentage of monthly budget)
- `usagePercent` — Current spending as a percentage of the monthly budget
- `totalSpent` — Total spending in the current month (in the budget's currency)
- `budgetAmount` — The monthly budget limit
- `currency` — ISO 4217 currency code (e.g., "USD")
- `year`, `month` — Year and month for the budget (1-12)

**Behavior:**
- Each threshold fires **at most once per session**
- Alerts are also pushed automatically when the user creates, updates, or deletes a transaction
- Multiple thresholds can fire in the same session (e.g., user hits 50%, then later 80%, then 100%)

### UI

Budget alerts appear as **toast notifications** (top-right corner):
- 50% and 80% thresholds: warning style (yellow/orange)
- 100% threshold: error style (red)

Each toast displays the alert message with the threshold percentage and current spending.

## Documentation

- **SPEC.md** — Complete API reference and data model
- **HELP.md** — Development notes
- **CLAUDE.md** — Project guidelines for Claude Code

## License

MIT
