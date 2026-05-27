---
name: budgettracker-spring-layer
description: >
  Use this skill whenever implementing or modifying any backend code for the BudgetTracker app —
  including entities, repositories, services, controllers, DTOs, exception handling, or Flyway
  migrations. Trigger on phrases like "add endpoint", "implement [domain]", "create the service",
  "write the migration", "add a field", "new feature backend", or any task that touches
  src/main/java or src/main/resources/db/migration. Also trigger when reviewing or debugging
  existing backend code. This skill is the single source of truth for conventions; always consult
  it before writing any Java or SQL for this project.
---

# BudgetTracker — Spring Boot Layer Skill

This skill governs all backend implementation for BudgetTracker: a Spring Boot 3 / Java 21 /
SQLite app with OAuth2 SSO (Google + GitHub). Read this before writing any Java or SQL.

For the full project spec, see @SPEC.md in the repo root.

## Critical Security Rule — Row-Level Isolation

**Every** data-access call MUST be scoped to the authenticated user's ID. There are no exceptions.

```java
// ALWAYS get userId this way in services:
UUID userId = ((AppUserDetails) SecurityContextHolder
    .getContext().getAuthentication().getPrincipal()).getUserId();

// NEVER accept userId from request parameters or path variables.
// NEVER call a repository method that doesn't filter by userId.
```

If you add a new repository method and forget the `userId` filter, you create a data-leak bug.
Every repository query signature must include `userId` as a parameter.

---

## Package Structure

```
com.budgettracker
  config/        SecurityConfig, CorsConfig, JacksonConfig
  auth/          OAuth2UserService, OAuth2SuccessHandler, AppUserDetails
  user/          User entity, UserRepository, UserService
  category/      Category entity, CategoryRepository, CategoryService, CategoryController, DTOs
  transaction/   Transaction entity, TransactionRepository, TransactionService,
                 TransactionController, TransactionFilters, DTOs
  budget/        MonthlyBudget entity, BudgetRepository, BudgetService, BudgetController, DTOs
  common/        PageResponse<T>, ErrorResponse, GlobalExceptionHandler, ConflictException,
                 NotFoundException
  resources/
    db/migration/ V1__init.sql, V2__..., ...  (Flyway; never modify existing files)
```

---

## Implementing a Domain (the standard loop)

When asked to implement or extend a domain (e.g. "add transactions"), follow this order:

1. **Entity** — JPA entity with proper relationships and constraints
2. **Repository** — Spring Data JPA interface; all queries scoped to `userId`
3. **DTOs** — separate Request and Response records; never expose entities directly
4. **Service** — business logic, user-scoping, exception mapping
5. **Controller** — thin; delegates entirely to service; no business logic
6. **Flyway migration** — only if schema changes (see Migration Rules below)

See `references/patterns.md` for copy-paste templates for each layer.

---

## Entity Conventions

```java
@Entity
@Table(name = "transactions")
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // All timestamps:
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}
```

- UUIDs for all PKs — use `@GeneratedValue(strategy = GenerationType.UUID)`
- Timestamps always `Instant` (not `LocalDateTime`); use `@CreationTimestamp` / `@UpdateTimestamp`
- Monetary amounts always `BigDecimal` (never `double` or `float`)
- Currency always `String` (ISO 4217, e.g. `"USD"`); store explicitly even for MVP
- Lazy-fetch all `@ManyToOne` and `@OneToMany` relations by default

---

## Repository Conventions

```java
public interface TransactionRepository extends JpaRepository<Transaction, UUID> {
    // ALL queries MUST include userId:
    Page<Transaction> findByUserIdOrderByTransactionDateDesc(UUID userId, Pageable pageable);

    Optional<Transaction> findByIdAndUserId(UUID id, UUID userId);  // for single-item lookup

    boolean existsByCategoryIdAndUserId(UUID categoryId, UUID userId);  // for guard checks

    // Custom JPQL example:
    @Query("SELECT t FROM Transaction t WHERE t.user.id = :userId AND t.category.id = :categoryId")
    List<Transaction> findByUserIdAndCategoryId(UUID userId, UUID categoryId, Pageable pageable);
}
```

**Never** write a query without `userId` in the `WHERE` clause or method name.

---

## DTO Conventions

Use Java records. Keep Request and Response as separate types.

```java
// Request DTO
public record CreateTransactionRequest(
    @NotNull UUID categoryId,
    @NotBlank @Size(max = 255) String title,
    @DecimalMin("0.01") @NotNull BigDecimal amount,
    @NotBlank @Size(min = 3, max = 3) String currency,
    @NotNull LocalDate transactionDate,
    @Size(max = 2000) String notes
) {}

// Response DTO — never expose entity directly
public record TransactionResponse(
    UUID id,
    UUID categoryId,
    String categoryName,
    String title,
    BigDecimal amount,
    String currency,
    LocalDate transactionDate,
    String notes,
    Instant createdAt,
    Instant updatedAt
) {
    public static TransactionResponse from(Transaction t) {
        return new TransactionResponse(
            t.getId(), t.getCategory().getId(), t.getCategory().getName(),
            t.getTitle(), t.getAmount(), t.getCurrency(),
            t.getTransactionDate(), t.getNotes(), t.getCreatedAt(), t.getUpdatedAt()
        );
    }
}
```

---

## Service Conventions

```java
@Service
@RequiredArgsConstructor
@Transactional
public class TransactionService {
    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public PageResponse<TransactionResponse> list(UUID userId, Pageable pageable) {
        Page<Transaction> page = transactionRepository
            .findByUserIdOrderByTransactionDateDesc(userId, pageable);
        return PageResponse.of(page.map(TransactionResponse::from));
    }

    public TransactionResponse create(UUID userId, CreateTransactionRequest req) {
        // Verify the category belongs to this user:
        Category category = categoryRepository.findByIdAndUserId(req.categoryId(), userId)
            .orElseThrow(() -> new NotFoundException("Category not found"));

        Transaction t = new Transaction();
        t.setUser(/* load user ref */);
        t.setCategory(category);
        // ... set other fields
        return TransactionResponse.from(transactionRepository.save(t));
    }

    public TransactionResponse getOne(UUID userId, UUID id) {
        return transactionRepository.findByIdAndUserId(id, userId)
            .map(TransactionResponse::from)
            .orElseThrow(() -> new NotFoundException("Transaction not found"));
    }
}
```

- Mark read-only methods with `@Transactional(readOnly = true)`
- Always verify cross-entity ownership (e.g. category belongs to the same user) before associating

---

## Controller Conventions

```java
@RestController
@RequestMapping("/api/v1/transactions")
@RequiredArgsConstructor
public class TransactionController {
    private final TransactionService transactionService;

    @GetMapping
    public PageResponse<TransactionResponse> list(
            @AuthenticationPrincipal AppUserDetails principal,
            Pageable pageable) {
        return transactionService.list(principal.getUserId(), pageable);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TransactionResponse create(
            @AuthenticationPrincipal AppUserDetails principal,
            @Valid @RequestBody CreateTransactionRequest request) {
        return transactionService.create(principal.getUserId(), request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @AuthenticationPrincipal AppUserDetails principal,
            @PathVariable UUID id) {
        transactionService.delete(principal.getUserId(), id);
    }
}
```

- Controllers are **thin** — no business logic, no direct repository calls
- Always extract `userId` via `@AuthenticationPrincipal AppUserDetails`; never from the request body
- HTTP status codes: `201 Created` for POST, `200 OK` for GET/PUT/PATCH, `204 No Content` for DELETE

---

## Exception Handling & HTTP Status Codes

Use these exception types from `common/`:

| Exception          | HTTP Status    | When to throw                              |
|--------------------|----------------|--------------------------------------------|
| `NotFoundException`| `404`          | Entity not found for this user             |
| `ConflictException`| `409`          | Category has transactions; duplicate name  |
| Bean Validation    | `422`          | Automatic via `@Valid` + GlobalExceptionHandler |

Error response envelope (always this shape):
```json
{ "status": 422, "error": "Validation failed", "details": { "field": "message" } }
```

Category deletion guard (required — do not skip):
```java
if (transactionRepository.existsByCategoryIdAndUserId(categoryId, userId)) {
    throw new ConflictException(
        "Category has associated transactions. Reassign or delete them first.");
}
```

---

## Pagination

All list endpoints return this envelope:
```json
{ "data": [...], "page": 0, "size": 20, "total": 150 }
```

Use the shared `PageResponse<T>` from `common/`:
```java
public record PageResponse<T>(List<T> data, int page, int size, long total) {
    public static <T> PageResponse<T> of(Page<T> page) {
        return new PageResponse<>(page.getContent(), page.getNumber(),
            page.getSize(), page.getTotalElements());
    }
}
```

---

## Flyway Migration Rules

- **Never modify existing migration files.** Even to fix a typo.
- File naming: `V{N}__{snake_case_description}.sql` (e.g. `V2__add_notes_to_transactions.sql`)
- Location: `src/main/resources/db/migration/`
- SQLite-specific constraints:
    - No `gen_random_uuid()` — generate UUIDs in Java, not SQL default
    - `ALTER TABLE` in SQLite is limited — to add a column: `ALTER TABLE t ADD COLUMN col TYPE`
    - No `TIMESTAMPTZ` — use `TEXT` and store ISO-8601 strings; Hibernate handles conversion
    - Boolean: use `INTEGER` (0/1)
    - Check constraints in `CREATE TABLE` only — can't add them via `ALTER TABLE`

---

## Checklist Before Submitting Backend Code

- [ ] Every repository query is scoped to `userId`
- [ ] No `userId` accepted from request body or path variables
- [ ] Controller uses `@AuthenticationPrincipal`, not `SecurityContextHolder` directly
- [ ] Request DTOs use Bean Validation annotations
- [ ] Response DTOs are records with a static `from()` factory; no entity leakage
- [ ] Monetary values are `BigDecimal`; currency is an explicit `String`
- [ ] List endpoints return `PageResponse<T>`
- [ ] New Flyway migration added if schema changed (and no existing file modified)
- [ ] `@Transactional(readOnly = true)` on read-only service methods
- [ ] Category deletion guard in place if touching category delete logic

---

## Reference Files

- `references/patterns.md` — Full copy-paste templates for each layer (entity, repo, service, controller, DTO, migration)
- `references/sqlite-gotchas.md` — SQLite-specific quirks with Spring Boot / Hibernate / Flyway