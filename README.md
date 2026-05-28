# Personal Expense Tracker

A full-stack personal-finance web application for tracking spending across customizable categories, setting monthly budgets, and analyzing expense trends. Uses OAuth 2.0 (Google and GitHub) for authentication with real-time WebSocket budget alerts.

## Tech Stack

- **Backend:** Java 21, Spring Boot 4.0.6, Spring Security (OAuth2), Spring Data JDBC, Flyway, WebSocket
- **Database:** SQLite 3 (file-based)
- **Frontend:** React 18, TypeScript, TailwindCSS, React Query (TanStack Query v5), Vite
- **Build:** Gradle (backend), npm (frontend)

## Quick Start

### Prerequisites

- **Java 21 (LTS)** — Backend runtime
- **Gradle 9.4+** — Backend build tool (or use `./gradlew`)
- **Node.js 18+** — Frontend runtime & npm

### Environment Configuration

Before running the backend, you must configure environment variables and OAuth credentials.

#### Create `.env` File

Create a `.env` file in the project root with OAuth credentials and database settings (see .env.example):

```env
# SQLite (file-based, auto-created on first run)
SPRING_DATASOURCE_URL=jdbc:sqlite:./budgettracker.db

# OAuth2 Credentials (see sections below for setup)
SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GOOGLE_CLIENT_ID={paste_your_google_client_id}
SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GOOGLE_CLIENT_SECRET={paste_your_google_client_secret}

SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GITHUB_CLIENT_ID={paste_your_github_client_id}
SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GITHUB_CLIENT_SECRET={paste_your_github_client_secret}

# Application URLs (for local development)
APP_BASE_URL=http://localhost:3000
APP_CORS_ALLOWED_ORIGIN=http://localhost:3000
```

### Configuring Google OAuth 2.0

1. Visit [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or select an existing one)
3. Enable the **Google+ API**
4. Go to **APIs & Services → Credentials**
5. Click **Create Credentials → OAuth client ID**
6. Choose **Web application**
7. Add authorized redirect URIs:
   - `http://localhost:8080/login/oauth2/code/google` (local development)
8. Copy the **Client ID** and **Client Secret** to your `.env` file:
   ```env
   SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GOOGLE_CLIENT_ID=...
   SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GOOGLE_CLIENT_SECRET=...
   ```

### Configuring GitHub OAuth 2.0

1. Go to **GitHub Settings → Developer settings → OAuth Apps**
2. Click **New OAuth App**
3. Fill in:
   - **Application name:** Personal Expense Tracker
   - **Homepage URL:** `http://localhost:3000` (local) or your production domain
   - **Authorization callback URL:** `http://localhost:8080/login/oauth2/code/github` (local)
4. GitHub will generate a **Client ID** and allow you to create a **Client Secret**
5. Copy both to your `.env` file:
   ```env
   SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GITHUB_CLIENT_ID=...
   SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GITHUB_CLIENT_SECRET=...
   ```

**Note:** GitHub does not guarantee a public email address; if unavailable, the user's `email` field will be `null`. The app handles this gracefully.

### Running Locally

Once environment variables are configured, start both servers:

#### Backend

```bash
./gradlew bootRun
```

Runs on `http://localhost:8080`. SQLite database is auto-created at `./budgettracker.db` with Flyway migrations applied automatically.

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:3000`. Vite dev server proxies `/api/*` and `/oauth2/*` requests to `http://localhost:8080`.

Both servers are required for the app to work. Open `http://localhost:3000` once both are running.

## Testing

### Backend Tests

```bash
# Run all tests
./gradlew test
```

Tests use `@SpringBootTest` for integration testing with an in-memory SQLite database. OAuth2 context is mocked with `@WithMockUser` or custom `SecurityContext` setup.

### Frontend Tests

```bash
# Run all tests
npm run test
```

Frontend tests use Vitest and React Testing Library. Component tests verify behavior and accessibility.

## REST API Overview

The backend provides a complete REST API for managing transactions, categories, budgets, and user profiles. All endpoints are prefixed with `/api/v1` and require OAuth2 authentication.

### Core Endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| `/oauth2/authorization/{google,github}` | GET | Redirect to OAuth provider |
| `/api/v1/me` | GET | Get current user profile |
| `/api/v1/auth/logout` | POST | Logout and invalidate session |
| `/api/v1/categories` | GET, POST | List/create categories |
| `/api/v1/categories/{id}` | PATCH, DELETE | Update/delete category |
| `/api/v1/transactions` | GET, POST | List (with search/filters)/create transactions |
| `/api/v1/transactions/{id}` | GET, PUT, PATCH, DELETE | Get/update/delete transaction |
| `/api/v1/budgets` | GET | List all budgets |
| `/api/v1/budgets/{year}/{month}` | GET, PUT, DELETE | Get/set/delete monthly budget |
| `/api/v1/budgets/{year}/{month}/summary` | GET | Budget summary (spent/remaining/usage%) |

### Response Format

**Success responses:**
- Creates: `201 Created`
- Updates: `200 OK`
- Deletes: `204 No Content`
- Lists: Paginated JSON with `data`, `page`, `size`, `total`

**Error responses:**
- Invalid input: `422 Unprocessable Entity`
- Unauthorized: `401 Unauthorized`
- Conflict (e.g., category has transactions): `409 Conflict`

Example error response:
```json
{
  "status": 422,
  "error": "Validation failed",
  "details": { "amount": "must be greater than 0.01", "title": "must not be blank" }
}
```

### Search & Filtering

**Transactions** support filtering via query parameters:
- `q` — Full-text search on title and notes
- `categoryId` — Filter by category UUID
- `dateRange` — `this_month` or `last_month`
- `dateFrom` / `dateTo` — Custom date range (ISO format: `YYYY-MM-DD`)
- `amountMin` / `amountMax` — Amount range filter
- `page` / `size` — Pagination (default: page 0, size 20)

Example:
```bash
GET /api/v1/transactions?q=groceries&categoryId=abc-123&dateRange=this_month&page=0&size=20
```

### Authentication

All `/api/**` routes require a valid session cookie (set after OAuth2 login). Unauthenticated requests receive `401 Unauthorized`.

Session details:
- **TTL:** 7 days (sliding window)
- **Cookie:** HttpOnly, Secure, SameSite=Lax
- **Logout:** `POST /api/v1/auth/logout` invalidates the session

For complete API documentation, see `SPEC.md`.

## Category Deletion Behavior

Categories can only be deleted if they have **no associated transactions**. This two-step validation ensures data integrity:

### Backend Behavior

When attempting to delete a category with transactions:
1. Backend returns `409 Conflict` with error message
2. Frontend receives the error and shows a confirmation modal
3. User must choose to **Reassign** transactions to another category OR **Delete all transactions**
4. After resolving the conflict, `DELETE /api/v1/categories/{id}` succeeds

### Frontend Experience

**Step 1: User clicks delete on a category**
- If the category has no transactions → deleted immediately
- If the category has transactions → modal appears

**Step 2: Reassign or Delete Modal**
The modal shows:
- Number of transactions affected (e.g., "This category has 5 transactions")
- Two action buttons:
  - **Reassign** — opens a dropdown to select another category, then reassigns all transactions
  - **Delete all transactions** — bulk-deletes all transactions in this category

**Step 3: Confirmation**
- After reassigning or deleting, the category delete request is retried
- Success: category is deleted, modal closes

This design prevents accidental data loss and forces explicit user decisions when deleting categories with data.

## WebSocket: Real-Time Budget Alerts

The application uses WebSocket to push real-time budget alerts to authenticated users. This enables instant notifications when spending crosses budget thresholds without requiring the user to refresh the page.

### Connection Setup

**Endpoint:** `ws://localhost:8080/ws/budget-alerts`

- Requires an active HTTP session (OAuth2 authentication)
- Unauthenticated upgrade requests are rejected with `401 Unauthorized`
- Connection automatically reconnects if the session is lost

### Message Format

#### Client → Server: SUBSCRIBE

Sent by the client immediately after WebSocket connection is established:

```json
{ "type": "SUBSCRIBE" }
```

**Server behavior:** Triggers immediate evaluation of the current month's budget. Any unnotified spending thresholds (50%, 80%, 100%) are sent back as `BUDGET_ALERT` messages.

#### Server → Client: CONNECTED

Sent once after successful WebSocket handshake and authentication:

```json
{ "type": "CONNECTED" }
```

#### Server → Client: BUDGET_ALERT

Sent when spending crosses a threshold or when triggered by `SUBSCRIBE`:

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

**Field descriptions:**
- `threshold` — Spending threshold crossed: `50`, `80`, or `100` (percentage of monthly budget)
- `usagePercent` — Current spending as percentage of budget
- `totalSpent` — Total spending in current month (in budget's currency)
- `budgetAmount` — Monthly budget limit amount
- `currency` — ISO 4217 currency code (e.g., `USD`, `EUR`, `GBP`)
- `year` — Budget year (e.g., 2026)
- `month` — Budget month (1-12)

### Budget Alert Rules

Budget alerts are triggered when:
1. **User subscribes** — Check current month's budget and send any unnotified thresholds
2. **Transaction created/updated/deleted** — Re-evaluate budget and send alerts for newly-crossed thresholds
3. **Budget amount updated** — Re-evaluate and send alerts based on new budget limit

**Threshold firing rules:**
- Each threshold (50%, 80%, 100%) fires **at most once per session**
- Multiple thresholds can fire in a single session (e.g., user hits 50%, then 80%, then 100% as they add transactions)
- Thresholds reset after logout/login
- Only fired for the current month (previous/future months do not trigger alerts)

### UI Notifications

Budget alerts appear as **toast notifications** in the top-right corner:
- **50% threshold:** Warning style (yellow/orange background)
- **80% threshold:** Warning style (yellow/orange background)
- **100% threshold:** Error style (red background)

Toast message format: `"You've reached 80% of your $1000 USD budget"`

Each toast auto-dismisses after 5 seconds or can be manually closed.

## Documentation

- **SPEC.md** — Complete API reference and data model
- **CLAUDE.md** — Project guidelines for Claude Code
