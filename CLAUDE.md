# CLAUDE.md

We're building the app described in @SPEC.md. Read that file for general architectural tasks or to double-check the 
exact database structure, tech stack or application architecture.

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Personal Expense Tracker** is a personal-finance web application that lets users track spending across customizable categories, set monthly budgets, and analyze expense trends. It uses OAuth 2.0 (Google and GitHub) for authentication with no password storage.

**Tech Stack:**
- **Backend:** Java 21, Spring Boot 4.0.6, Spring Security with OAuth2, Spring Data JDBC, Flyway migrations
- **Database:** SQLite 3 (file-based, no server required)
- **Frontend:** React 18, TypeScript, TailwindCSS, React Query (TanStack Query v5), Vite
- **Build:** Gradle (backend), npm (frontend)

## Build & Run Commands

### Backend (Java/Spring Boot)

```bash
# Build the project
./gradlew build

# Run locally (development mode with auto-reload via Spring DevTools)
./gradlew bootRun

# Run tests
./gradlew test

# Run a single test
./gradlew test --tests com.example.personalexpensetracker.YourTestClass

# Clean build artifacts
./gradlew clean

# Check for dependency vulnerabilities
./gradlew dependencyCheck
```

Backend starts on `http://localhost:8080`. SQLite database file (`budgettracker.db`) is created automatically in the project root on first run.

### Frontend (React/Vite)

```bash
# Install dependencies
npm install

# Start dev server (runs on http://localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run linting (if configured)
npm run lint

# Run tests (if configured)
npm run test
```

Vite dev server proxies `/api/*` and `/oauth2/*` requests to the backend at `http://localhost:8080`.

## Environment Setup

Create a `.env` file in the project root with:

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

## Architecture

### Backend Structure

```
com.example.personalexpensetracker
  ├─ config/           # SecurityConfig, CorsConfig, JacksonConfig
  ├─ auth/             # OAuth2UserService, OAuth2SuccessHandler
  ├─ user/             # User entity, repository, service
  ├─ category/         # Category entity, repo, service, controller, DTOs
  ├─ transaction/      # Transaction entity, repo, service, controller, DTOs
  ├─ budget/           # MonthlyBudget entity, repo, service, controller, DTOs
  ├─ common/           # PageResponse, ErrorResponse, GlobalExceptionHandler
  └─ resources/
     └─ db/migration/  # Flyway SQL scripts (V1__init.sql, V2__..., etc.)
```

### Data Model

Core entities with relationships:
- **users** 1→N **categories**, **transactions**, **monthly_budgets**
- **categories** 1→N **transactions**
- Every transaction **must** reference a category (NOT NULL constraint)
- Deletion of a category is blocked if transactions exist (returns 409 Conflict)

### Authentication Flow

1. OAuth2 Client flow: user redirected to `/oauth2/authorization/{provider}` (google|github)
2. Provider redirects back to `/login/oauth2/code/{provider}`
3. Spring Security exchanges code for tokens and calls custom `OAuth2UserService`
4. Backend upserts user record keyed by `provider + provider_user_id`
5. Spring Session creates HttpOnly, Secure, SameSite=Lax session cookie (7-day TTL)
6. Frontend confirms auth via `GET /api/v1/me`

All `/api/**` routes require authentication (401 for unauthenticated requests).

### Frontend Structure

```
src/
  ├─ api/              # Axios instance, typed API client functions
  ├─ components/       # Shared UI (Button, Input, Modal, Badge, CurrencyAmount)
  ├─ features/
  │  ├─ auth/          # LoginPage, AuthContext, useAuth hook
  │  ├─ categories/    # CategoryList, CategoryForm, CategoryDeleteGuard
  │  ├─ transactions/  # TransactionList, TransactionForm, TransactionFilters
  │  ├─ budget/        # BudgetSummaryCard, BudgetForm
  │  └─ dashboard/     # DashboardPage
  ├─ hooks/            # useDebounce, usePagination
  ├─ layouts/          # AppLayout, AuthLayout
  ├─ router/           # React Router v6 route definitions
  ├─ types/            # TypeScript interfaces and enums
  └─ utils/            # formatCurrency, formatDate, cn
```

### Database Migrations

- Flyway manages schema changes via `src/main/resources/db/migration/`
- **Never** modify existing migration files; always create new numbered versions
- Database auto-initializes on first Spring Boot startup

## Key Design Decisions

### Currency Handling

- MVP supports single currency per user (ISO 4217 code, default USD)
- All amounts must be wrapped in `<CurrencyAmount>` component on frontend for consistent display
- Currency code or symbol always visible alongside amounts (never bare numbers)

### Category Deletion Guard

When deleting a category with existing transactions:
1. Backend returns `409 Conflict` with error message
2. Frontend shows modal listing affected transaction count
3. User must choose to **Reassign** (pick another category) or **Delete all transactions**
4. Only then does `DELETE /api/v1/categories/{id}` succeed

This two-step validation happens in both backend service layer and frontend UI.

### API Response Format

**Success:**
- Creates: `201 Created`
- Updates: `200 OK`
- Deletes: `204 No Content`
- Lists: paginated JSON with `data`, `page`, `size`, `total`

**Errors:**
```json
{ "status": 422, "error": "Validation failed", "details": { "field": "message" } }
```

### Validation

Bean Validation 3 (Hibernate Validator) on all DTOs:
- Amounts: `@DecimalMin("0.01")`
- Currency: `@NotBlank`, 3-char ISO code
- Titles: `@NotBlank`, max 255 chars
- Transaction date: `@NotNull`
- Category ID: `@NotNull` (every transaction must have one)

### Row-Level Security

All data access is scoped to the authenticated user:
- User ID extracted from Spring Security context in service layer
- Every repository call filters by `user_id`
- No cross-user data leakage possible

### Search & Filtering

- **Transactions:** Full-text search on title + notes, category filter, date range (this_month|last_month|custom), amount range
- **Search:** Debounced 300ms before query update
- **URL state:** All active filters reflected as search params (shareable links, back button works)

### State Management

**React Query (TanStack Query v5):**
- Query keys namespaced: `['transactions', filters]`, `['categories']`, `['budget', year, month]`
- Stale time: 60s for categories/budgets, 30s for transactions
- Mutations invalidate related queries

**AuthContext:**
- Only holds current user profile + loading state
- Not used for other application state

## REST API Overview

**Base path:** `/api/v1` (all timestamps ISO-8601 UTC, all IDs are UUIDs)

| Endpoint | Method | Purpose |
|---|---|---|
| `/oauth2/authorization/{google,github}` | GET | Redirect to OAuth provider |
| `/api/v1/me` | GET | Current user profile (or 401) |
| `/api/v1/auth/logout` | POST | Invalidate session |
| `/api/v1/categories` | GET/POST | List/create categories |
| `/api/v1/categories/{id}` | PATCH/DELETE | Update/delete category |
| `/api/v1/transactions` | GET/POST | List (with search/filters)/create transactions |
| `/api/v1/transactions/{id}` | GET/PUT/PATCH/DELETE | Get/update/delete transaction |
| `/api/v1/budgets` | GET | List all budgets |
| `/api/v1/budgets/{year}/{month}` | GET/PUT/DELETE | Get/set/delete monthly budget |
| `/api/v1/budgets/{year}/{month}/summary` | GET | Budget summary (spent/remaining/usage%) |

See SPEC.md for full endpoint documentation and request/response schemas.

## Common Development Tasks

### Adding a New Entity

1. Create entity class in `com.example.personalexpensetracker.{feature}` package
2. Create `{Feature}Repository` extending `CrudRepository<Entity, UUID>`
3. Create `{Feature}Service` with business logic (scoped to user)
4. Create DTOs for request/response (validation via `@Valid`)
5. Create `{Feature}Controller` with `@RestController`, route to `/api/v1/{features}`
6. Create Flyway migration (`V{N}__add_{feature}_table.sql`)
7. Write tests in `src/test/java` mirroring package structure

### Adding a New API Endpoint

1. Add method to controller with `@GetMapping`, `@PostMapping`, etc.
2. Add validation via DTOs with `@Valid` parameter
3. Extract `userId` from `SecurityContextHolder.getContext().getAuthentication().getPrincipal()`
4. Return `ResponseEntity` with appropriate status code
5. Test via `@SpringBootTest`, mock Spring Security context with `@WithMockUser`

### Updating the Database Schema

1. Create new file: `src/main/resources/db/migration/V{N}__{description}.sql`
2. Flyway runs migrations automatically on startup
3. Never alter existing migration files

### Testing

**Backend:**
- Unit tests in `src/test/java` mirroring package structure
- Use `@SpringBootTest` for integration tests
- Mock OAuth2 context with `@WithMockUser` or custom `SecurityContext`

**Frontend:**
- Component tests use React Testing Library (if configured)
- E2E tests can be added with Playwright/Cypress (not currently configured)

### Debugging

**Backend:**
- Spring DevTools enables auto-reload on file changes
- H2/SQLite console available via `/h2-console` (if H2 enabled)
- Check `application.yaml` for logging configuration

**Frontend:**
- React DevTools browser extension
- Vite dev server shows HMR status in console
- React Query DevTools can be added for query inspection

## Notes

- The SPEC.md document is the authoritative source for detailed API contracts, data model, and requirements
- All work should follow Spring Boot / React best practices and conventions already established in the codebase
- Lombok is used for entity boilerplate (`@Data`, `@Builder`, `@AllArgsConstructor`, etc.)
- H2Console is included for local development inspection (disabled in production)
