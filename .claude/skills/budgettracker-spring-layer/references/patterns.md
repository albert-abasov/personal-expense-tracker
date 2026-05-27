# BudgetTracker — Spring Boot Layer Templates

Copy-paste starting points for each layer. Replace `{Domain}` / `{domain}` / `{domains}` with
the actual domain name (e.g. `Transaction` / `transaction` / `transactions`).

---

## Entity

```java
package com.budgettracker.{domain};

import com.budgettracker.user.User;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "{domains}")
public class {Domain} {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // TODO: domain-specific fields here

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;

    // Getters and setters (or use Lombok @Getter @Setter)
}
```

---

## Repository

```java
package com.budgettracker.{domain};

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface {Domain}Repository extends JpaRepository<{Domain}, UUID> {

    // Primary listing query — ALWAYS scoped to userId
    Page<{Domain}> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    // Single-item lookup — includes userId to prevent cross-user access
    Optional<{Domain}> findByIdAndUserId(UUID id, UUID userId);

    // Existence check (for guards)
    boolean existsByIdAndUserId(UUID id, UUID userId);

    // Add domain-specific queries below — ALL must include userId
}
```

---

## DTOs

```java
package com.budgettracker.{domain};

import jakarta.validation.constraints.*;
import java.time.Instant;
import java.util.UUID;

// --- Request ---
public record Create{Domain}Request(
    // TODO: add fields with Bean Validation annotations
    // Example fields:
    @NotBlank @Size(max = 255) String title,
    @DecimalMin("0.01") @NotNull java.math.BigDecimal amount,
    @NotBlank @Size(min = 3, max = 3) String currency
) {}

public record Update{Domain}Request(
    // Same fields as Create, all optional (or required per business logic)
    @NotBlank @Size(max = 255) String title
) {}

// --- Response ---
public record {Domain}Response(
    UUID id,
    // TODO: add domain fields
    Instant createdAt,
    Instant updatedAt
) {
    public static {Domain}Response from({Domain} entity) {
        return new {Domain}Response(
            entity.getId(),
            // TODO: map fields
            entity.getCreatedAt(),
            entity.getUpdatedAt()
        );
    }
}
```

---

## Service

```java
package com.budgettracker.{domain};

import com.budgettracker.common.ConflictException;
import com.budgettracker.common.NotFoundException;
import com.budgettracker.common.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class {Domain}Service {

    private final {Domain}Repository {domain}Repository;

    @Transactional(readOnly = true)
    public PageResponse<{Domain}Response> list(UUID userId, Pageable pageable) {
        return PageResponse.of(
            {domain}Repository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map({Domain}Response::from)
        );
    }

    @Transactional(readOnly = true)
    public {Domain}Response getOne(UUID userId, UUID id) {
        return {domain}Repository.findByIdAndUserId(id, userId)
            .map({Domain}Response::from)
            .orElseThrow(() -> new NotFoundException("{Domain} not found"));
    }

    public {Domain}Response create(UUID userId, Create{Domain}Request req) {
        {Domain} entity = new {Domain}();
        // TODO: set user reference (load by userId)
        // TODO: map request fields to entity
        return {Domain}Response.from({domain}Repository.save(entity));
    }

    public {Domain}Response update(UUID userId, UUID id, Update{Domain}Request req) {
        {Domain} entity = {domain}Repository.findByIdAndUserId(id, userId)
            .orElseThrow(() -> new NotFoundException("{Domain} not found"));
        // TODO: update fields
        return {Domain}Response.from({domain}Repository.save(entity));
    }

    public void delete(UUID userId, UUID id) {
        {Domain} entity = {domain}Repository.findByIdAndUserId(id, userId)
            .orElseThrow(() -> new NotFoundException("{Domain} not found"));
        // TODO: add any pre-delete guards (e.g. ConflictException if related data exists)
        {domain}Repository.delete(entity);
    }
}
```

---

## Controller

```java
package com.budgettracker.{domain};

import com.budgettracker.auth.AppUserDetails;
import com.budgettracker.common.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/{domains}")
@RequiredArgsConstructor
public class {Domain}Controller {

    private final {Domain}Service {domain}Service;

    @GetMapping
    public PageResponse<{Domain}Response> list(
            @AuthenticationPrincipal AppUserDetails principal,
            Pageable pageable) {
        return {domain}Service.list(principal.getUserId(), pageable);
    }

    @GetMapping("/{id}")
    public {Domain}Response getOne(
            @AuthenticationPrincipal AppUserDetails principal,
            @PathVariable UUID id) {
        return {domain}Service.getOne(principal.getUserId(), id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public {Domain}Response create(
            @AuthenticationPrincipal AppUserDetails principal,
            @Valid @RequestBody Create{Domain}Request request) {
        return {domain}Service.create(principal.getUserId(), request);
    }

    @PutMapping("/{id}")
    public {Domain}Response update(
            @AuthenticationPrincipal AppUserDetails principal,
            @PathVariable UUID id,
            @Valid @RequestBody Update{Domain}Request request) {
        return {domain}Service.update(principal.getUserId(), id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @AuthenticationPrincipal AppUserDetails principal,
            @PathVariable UUID id) {
        {domain}Service.delete(principal.getUserId(), id);
    }
}
```

---

## Flyway Migration Template

Filename: `V{N}__{description}.sql`

```sql
-- V2__add_{domain}_table.sql

CREATE TABLE IF NOT EXISTS {domains} (
    id          TEXT PRIMARY KEY,           -- UUID stored as TEXT in SQLite
    user_id     TEXT NOT NULL,
    -- TODO: domain-specific columns
    -- amount   NUMERIC(12, 2) NOT NULL,
    -- currency TEXT NOT NULL DEFAULT 'USD',
    -- title    TEXT NOT NULL,
    created_at  TEXT NOT NULL,              -- ISO-8601 UTC string
    updated_at  TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_{domains}_user_id ON {domains}(user_id);
-- Add more indexes based on common query patterns
```

**SQLite reminders (do not use PostgreSQL syntax):**
- PKs: `TEXT PRIMARY KEY` (UUID generated in Java, not SQL)
- Timestamps: `TEXT` (Hibernate stores ISO-8601 automatically)
- No `TIMESTAMPTZ`, no `gen_random_uuid()`, no `SERIAL`
- `CHECK` constraints only in `CREATE TABLE`, not `ALTER TABLE`
- To add a column to an existing table: `ALTER TABLE t ADD COLUMN col TYPE;`