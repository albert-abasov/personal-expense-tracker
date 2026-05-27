# BudgetTracker — Technical Specification

| | |
|---|---|
| **Backend** | Java 21, Spring Boot 3, Spring Security OAuth2, Hibernate 6 |
| **Frontend** | React 18, TypeScript, TailwindCSS, React Query, Context API |
| **Database** | SQLite 3 |
| **Auth** | SSO — Google OAuth 2.0 + GitHub OAuth |

---

## 1. Introduction

BudgetTracker is a multi-user personal-finance web application that lets each user track spending across customisable categories, set monthly budgets, and analyse expense trends. Every user sees only their own data.

This document covers the full technical architecture: data model, REST API, frontend structure, authentication flow, non-functional requirements.

---

## 2. System Architecture

### 2.1 High-Level Overview

The application follows a classic three-tier architecture:

- **React SPA (browser)** — communicates over HTTPS with the Spring Boot API.
- **Spring Boot REST API** — handles all business logic, auth, and DB access.
- **PostgreSQL** — single relational database.
- **OAuth providers (Google, GitHub)** — external identity providers; the backend never stores passwords.

### 2.2 Technology Stack

| Layer | Technology | Notes |
|---|---|---|
| Runtime | Java 21 (LTS) | Virtual threads via Project Loom |
| Framework | Spring Boot 3.x | Spring MVC, Spring Data JPA |
| Security | Spring Security 6 + OAuth2 Client | Session cookie strategy |
| ORM | Hibernate 6 / JPA | Flyway for schema migrations |
| Database | SQLite 3 | File-based; no server required |
| Frontend | React 18 + TypeScript 5 | Vite build tool |
| Styling | TailwindCSS 3 | shadcn/ui component primitives |
| State / Data | React Query (TanStack v5) + Context | Context for auth state only |
| Dev Environment | Local PostgreSQL + Maven + npm | No containerization required |

---

## 3. Authentication

### 3.1 Strategy

Authentication is SSO-only. There are no username/password credentials stored in the application. Two OAuth 2.0 providers are supported: Google and GitHub.

Spring Security's OAuth2 Client starter manages the Authorization Code flow. On a successful callback, the backend:

- Looks up or creates a local user record keyed by `provider` + `provider_user_id`.
- Issues an `HttpOnly`, `Secure`, `SameSite=Lax` session cookie via Spring Session.
- Returns a `200` JSON response with basic user info to the frontend.

### 3.2 OAuth Flow (both providers)

1. Frontend redirects to `GET /oauth2/authorization/{provider}` (`provider` = `google` | `github`).
2. Spring Security redirects the browser to the provider consent screen.
3. Provider redirects back to `GET /login/oauth2/code/{provider}`.
4. Spring Security exchanges the code for tokens, loads the principal, calls the custom `OAuth2UserService`.
5. Backend upserts the user row, creates a Spring Session, sets cookie.
6. Browser is redirected to the frontend SPA root; React reads `GET /api/v1/me` to confirm auth.

### 3.3 Session & Logout

- Session TTL: 7 days (sliding). Stored in the `sessions` table (Spring Session JDBC).
- `POST /api/v1/auth/logout` — invalidates the server-side session and clears the cookie.
- Unauthenticated requests to protected endpoints receive `401`; the frontend redirects to `/login`.

---

## 4. Database Schema

### 4.1 Entity Relationship Summary

```
users 1──N categories
users 1──N transactions
users 1──N monthly_budgets
categories 1──N transactions
sessions  (Spring Session managed)
```

### 4.2 Table: `users`

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` |
| `provider` | `VARCHAR(32)` | `NOT NULL` — `google` \| `github` |
| `provider_user_id` | `VARCHAR(128)` | `NOT NULL` |
| `email` | `VARCHAR(255)` | `NULLABLE` — not all providers guarantee an email |
| `display_name` | `VARCHAR(255)` | `NOT NULL` |
| `avatar_url` | `TEXT` | `NULLABLE` |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` |
| | | `UNIQUE (provider, provider_user_id)` |

> **Note on `email`:** GitHub does not guarantee a public email address. The column is therefore `NULLABLE`. The application must not require email for any login or display logic. If an email is available it should be stored; otherwise the field is left `NULL`.

### 4.3 Table: `categories`

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` |
| `user_id` | `UUID` | `NOT NULL`, `FK → users(id) ON DELETE CASCADE` |
| `name` | `VARCHAR(100)` | `NOT NULL` |
| `color` | `VARCHAR(7)` | `NULLABLE` — `#RRGGBB` hex |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` |
| | | `UNIQUE (user_id, name)` |

### 4.4 Table: `transactions`

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` |
| `user_id` | `UUID` | `NOT NULL`, `FK → users(id) ON DELETE CASCADE` |
| `category_id` | `UUID` | **`NOT NULL`**, `FK → categories(id)` — every transaction must have a category |
| `title` | `VARCHAR(255)` | `NOT NULL` |
| `amount` | `NUMERIC(12,2)` | `NOT NULL`, `CHECK (amount > 0)` |
| `currency` | `VARCHAR(3)` | `NOT NULL`, `DEFAULT 'USD'` — ISO 4217 code; single currency for MVP |
| `transaction_date` | `DATE` | `NOT NULL` |
| `notes` | `TEXT` | `NULLABLE` |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` |

> **Notes on `category_id`:** Unlike the previous draft, a category is **required** on every transaction (no `NULL`). If the user deletes a category that has associated transactions, the deletion must be **blocked** and the API must return `409 Conflict` with a descriptive message. The frontend must surface this error and prompt the user to reassign or delete the transactions first.

> **Notes on `currency`:** The MVP supports a single currency. The `currency` column is stored explicitly so the data model is upgrade-safe. All transactions for a given user are expected to use the same currency code. The UI must display the currency symbol/code on every amount field — amounts must never appear as bare numbers.

### 4.5 Table: `monthly_budgets`

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` |
| `user_id` | `UUID` | `NOT NULL`, `FK → users(id) ON DELETE CASCADE` |
| `year` | `SMALLINT` | `NOT NULL` |
| `month` | `SMALLINT` | `NOT NULL`, `CHECK (month BETWEEN 1 AND 12)` |
| `amount` | `NUMERIC(12,2)` | `NOT NULL`, `CHECK (amount > 0)` |
| `currency` | `VARCHAR(3)` | `NOT NULL`, `DEFAULT 'USD'` — must match user's transaction currency |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` |
| | | `UNIQUE (user_id, year, month)` |

### 4.6 Indexes

- `transactions(user_id, transaction_date DESC)` — primary listing query.
- `transactions(user_id, category_id)` — category filter.
- `transactions(user_id)` + GIN index on `to_tsvector('english', title || ' ' || COALESCE(notes, ''))` — full-text search.
- `categories(user_id)` — all user's categories.
- `monthly_budgets(user_id, year, month)` — covered by the unique constraint.

---

## 5. REST API Design

### 5.1 Conventions

- Base path: `/api/v1`
- All requests and responses use `Content-Type: application/json`.
- Authentication verified via session cookie on every request.
- Successful creates return `201 Created`. Updates return `200 OK`. Deletes return `204 No Content`.
- Error envelope:
  ```json
  { "status": 422, "error": "Validation failed", "details": { "field": "message" } }
  ```
- All list endpoints return paginated responses:
  ```json
  { "data": [...], "page": 0, "size": 20, "total": 150 }
  ```
- All timestamps are ISO-8601 UTC strings. All IDs are UUIDs.

### 5.2 Auth Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/oauth2/authorization/google` | Redirect to Google consent screen |
| `GET` | `/oauth2/authorization/github` | Redirect to GitHub consent screen |
| `GET` | `/api/v1/me` | Return current user profile (`200`) or `401` |
| `POST` | `/api/v1/auth/logout` | Invalidate session, clear cookie |

`GET /api/v1/me` response body:
```json
{
  "id": "uuid",
  "provider": "google",
  "email": "user@example.com",
  "displayName": "Jane Smith",
  "avatarUrl": "https://..."
}
```
`email` and `avatarUrl` may be `null`.

### 5.3 Category Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/v1/categories` | List all categories for the authenticated user |
| `POST` | `/api/v1/categories` | Create a new category |
| `PATCH` | `/api/v1/categories/{id}` | Rename or recolour a category |
| `DELETE` | `/api/v1/categories/{id}` | Delete category — returns `409` if transactions exist |

`POST` / `PATCH` request body:
```json
{ "name": "Groceries", "color": "#22C55E" }
```

Response body (single category):
```json
{ "id": "uuid", "name": "Groceries", "color": "#22C55E", "createdAt": "2026-05-01T00:00:00Z" }
```

### 5.4 Transaction Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/v1/transactions` | List / search / filter transactions |
| `POST` | `/api/v1/transactions` | Create a transaction |
| `GET` | `/api/v1/transactions/{id}` | Get single transaction |
| `PUT` | `/api/v1/transactions/{id}` | Replace all fields |
| `PATCH` | `/api/v1/transactions/{id}` | Update selected fields |
| `DELETE` | `/api/v1/transactions/{id}` | Delete transaction |

`GET /api/v1/transactions` — supported query parameters:

| Param | Type | Description |
|---|---|---|
| `q` | string | Full-text search across `title` and `notes` |
| `categoryId` | UUID | Filter by category |
| `dateRange` | enum | `this_month` \| `last_month` |
| `dateFrom` / `dateTo` | date | ISO date `YYYY-MM-DD`; used when `dateRange` is absent |
| `amountMin` / `amountMax` | decimal | Amount range filter |
| `page` / `size` | int | Pagination (defaults: `0` / `20`) |
| `sort` | string | e.g. `transaction_date,desc` |

`POST` / `PUT` request body:
```json
{
  "title": "Supermarket",
  "amount": 45.90,
  "currency": "USD",
  "transactionDate": "2026-05-20",
  "categoryId": "uuid",
  "notes": "weekly shop"
}
```

`categoryId` is **required**. `currency` defaults to `"USD"` server-side if omitted, but the UI must always send it explicitly.

### 5.5 Monthly Budget Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/v1/budgets` | List all budgets for the user |
| `GET` | `/api/v1/budgets/{year}/{month}` | Get budget for a specific month |
| `PUT` | `/api/v1/budgets/{year}/{month}` | Upsert budget amount for a month |
| `DELETE` | `/api/v1/budgets/{year}/{month}` | Remove budget for a month |
| `GET` | `/api/v1/budgets/{year}/{month}/summary` | Budget summary for the month |

`GET .../summary` response body:
```json
{
  "year": 2026,
  "month": 5,
  "currency": "USD",
  "budgetAmount": 2000.00,
  "totalSpent": 1340.50,
  "remaining": 659.50,
  "usagePercent": 67.0,
  "hasBudget": true
}
```

When `hasBudget` is `false`, `budgetAmount`, `remaining`, and `usagePercent` are `null`. The frontend must render a **"No budget set"** state — never display `null` or `0` as a budget figure.

---

## 6. Backend Architecture

### 6.1 Package Structure

```
com.budgettracker
  config/           # SecurityConfig, CorsConfig, JacksonConfig
  auth/             # OAuth2UserService, OAuth2SuccessHandler
  user/             # User entity, UserRepository, UserService
  category/         # Category entity, repo, service, controller, DTOs
  transaction/      # Transaction entity, repo, service, controller, DTOs
  budget/           # MonthlyBudget entity, repo, service, controller, DTOs
  common/           # PageResponse, ErrorResponse, GlobalExceptionHandler
  resources/
    db/migration/   # Flyway SQL scripts (V1__init.sql, V2__..., ...)
```

### 6.2 Security Configuration

- All `/api/**` routes require authentication.
- CSRF disabled (session cookie is `SameSite=Lax`; API is not form-submitted).
- CORS: allow the configured frontend origin; `credentials: true`.
- OAuth2 success handler upserts user and redirects to the SPA.
- OAuth2 failure handler redirects to `/login?error`.
- Row-level security enforced in the service layer: every repository call is scoped to the authenticated user's ID extracted from the security context.

### 6.3 Validation

Bean Validation 3 (Hibernate Validator) on all request DTOs:

| Field | Rule |
|---|---|
| `amount` | `@DecimalMin("0.01")` |
| `currency` | `@NotBlank`, `@Size(min=3, max=3)` — must be a valid ISO 4217 code |
| `transactionDate` | `@NotNull` |
| `title` | `@NotBlank`, `@Size(max=255)` |
| `categoryId` | `@NotNull` |
| `notes` | optional, `@Size(max=2000)` |
| category `name` | `@NotBlank`, `@Size(max=100)`; uniqueness at DB level, returned as `409 Conflict` |

### 6.4 Category Deletion Guard

Before deleting a category, the service checks whether any transactions reference it:

```java
if (transactionRepository.existsByCategoryId(categoryId)) {
    throw new ConflictException("Category has associated transactions. Reassign or delete them first.");
}
```

This returns `409 Conflict`. The frontend must surface a clear error message with options to reassign or bulk-delete affected transactions.

### 6.5 Database Migrations

- Flyway manages all schema changes.
- Migration files live in `src/main/resources/db/migration/`.
- Never modify existing migration files; always add a new numbered version.

---

## 7. Frontend Architecture

### 7.1 Project Structure

```
src/
  api/              # Axios instance, typed API client functions
  components/       # Shared UI (Button, Input, Modal, Badge, CurrencyAmount...)
  features/
    auth/           # LoginPage, AuthContext, useAuth hook
    categories/     # CategoryList, CategoryForm, CategoryDeleteGuard
    transactions/   # TransactionList, TransactionForm, TransactionFilters
    budget/         # BudgetSummaryCard, BudgetForm
    dashboard/      # DashboardPage (budget summary + recent transactions)
  hooks/            # useDebounce, usePagination
  layouts/          # AppLayout (nav + outlet), AuthLayout
  router/           # React Router v6 route definitions
  types/            # Shared TypeScript interfaces and enums
  utils/            # formatCurrency, formatDate, cn
```

### 7.2 Routing

- `/login` — public; shows Google and GitHub OAuth buttons.
- `/` — protected; redirects to `/dashboard`.
- `/dashboard` — budget summary + recent transactions.
- `/transactions` — full transaction list with search and filters.
- `/categories` — category management.
- `/settings` — future placeholder.

A `<ProtectedRoute>` wrapper checks `AuthContext`. Unauthenticated users are redirected to `/login`, preserving the intended path in location state.

### 7.3 State Management

React Query (TanStack Query v5) is the primary data layer:

- `useQuery` for all reads; `useMutation` for create / update / delete.
- Query keys namespaced: `['transactions', filters]`, `['categories']`, `['budget', year, month]`.
- On mutation success, related queries are invalidated.
- Stale time: 60 s for categories and budgets; 30 s for transactions.

`AuthContext` holds only the current user profile and loading state.

### 7.4 Currency Display

- A shared `<CurrencyAmount>` component wraps every monetary value: it accepts `amount` and `currency` (ISO 4217) and formats using `Intl.NumberFormat`.
- The currency code or symbol is always visible alongside the amount in the UI.
- The transaction form includes a read-only currency field showing the user's active currency (MVP: fixed at account level, changeable in Settings in a future version).

### 7.5 Search & Filter UX

- Search input debounced 300 ms before updating the query key.
- All active filters reflected as URL search params — links are shareable and the back button works.
- Filters panel: category multi-select, date range selector (`this month` / `last month` / custom), amount range min/max.
- Empty state distinct from loading and error states.

### 7.6 Category Delete Guard

When the user attempts to delete a category that has transactions, the UI must:

1. Show a modal listing the number of affected transactions.
2. Offer two actions: **Reassign** (pick another category) or **Delete all transactions**.
3. Only call `DELETE /api/v1/categories/{id}` after the user resolves the conflict.

### 7.7 Budget Summary Card

The card queries `GET /api/v1/budgets/{year}/{month}/summary` for the selected month.

- `hasBudget === false` → renders **"No budget set for this month"** with a *Set Budget* CTA.
- `hasBudget === true` → shows spent / remaining / progress bar + currency code.
- `usagePercent >= 90` → bar turns amber.
- `usagePercent >= 100` → bar turns red.

---

## 8. Local Development Setup

### 8.1 Prerequisites

Install the following on your machine:

| Component | Version | Purpose |
|---|---|---|
| Java | 21 (LTS) | Backend runtime |
| Gradle | 9.4+ | Backend build tool |
| Node.js | 18+ | Frontend runtime & npm |

Note: SQLite is included in the JDBC driver — no separate database server installation required.

### 8.2 Environment Variables

Create a `.env` file in the backend root directory:

```env
# SQLite (file-based, no server needed)
SPRING_DATASOURCE_URL=jdbc:sqlite:./budgettracker.db
SPRING_DATASOURCE_USERNAME=
SPRING_DATASOURCE_PASSWORD=

# OAuth2 - Google
SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GOOGLE_CLIENT_ID=your_google_client_id
SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GOOGLE_CLIENT_SECRET=your_google_client_secret

# OAuth2 - GitHub
SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GITHUB_CLIENT_ID=your_github_client_id
SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GITHUB_CLIENT_SECRET=your_github_client_secret

# Application URLs
APP_BASE_URL=http://localhost:3000
APP_CORS_ALLOWED_ORIGIN=http://localhost:3000
```

### 8.3 Running Locally

**Backend (Spring Boot):**
```bash
# The first run creates the SQLite database and executes Flyway migrations automatically
./gradlew bootRun
# Backend starts on http://localhost:8080
# SQLite database file created at: budgettracker.db
```

**Frontend (Vite dev server):**
```bash
npm install
npm run dev
# Frontend starts on http://localhost:3000
# Vite proxies /api/* and /oauth2/* to http://localhost:8080
```

Once both are running, open http://localhost:3000 in your browser.

---