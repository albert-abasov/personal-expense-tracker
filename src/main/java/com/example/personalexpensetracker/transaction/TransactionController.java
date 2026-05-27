package com.example.personalexpensetracker.transaction;

import com.example.personalexpensetracker.auth.CustomOAuth2User;
import com.example.personalexpensetracker.common.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @GetMapping
    public ResponseEntity<PageResponse<TransactionResponse>> list(
            Authentication authentication,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String categoryId,
            @RequestParam(required = false) String dateRange,
            @RequestParam(required = false) LocalDate dateFrom,
            @RequestParam(required = false) LocalDate dateTo,
            @RequestParam(required = false) BigDecimal amountMin,
            @RequestParam(required = false) BigDecimal amountMax,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "transaction_date,desc") String sort) {

        String userId = extractUserId(authentication);

        Sort sorting = parseSort(sort);
        Pageable pageable = PageRequest.of(page, size, sorting);
        TransactionListParams params = new TransactionListParams(
            q, categoryId, dateRange, dateFrom, dateTo, amountMin, amountMax
        );

        return ResponseEntity.ok(transactionService.list(userId, params, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TransactionResponse> getOne(
            Authentication authentication,
            @PathVariable String id) {
        String userId = extractUserId(authentication);
        return ResponseEntity.ok(transactionService.getOne(userId, id));
    }

    @PostMapping
    public ResponseEntity<TransactionResponse> create(
            Authentication authentication,
            @Valid @RequestBody CreateTransactionRequest request) {
        String userId = extractUserId(authentication);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(transactionService.create(userId, request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TransactionResponse> replace(
            Authentication authentication,
            @PathVariable String id,
            @Valid @RequestBody UpdateTransactionRequest request) {
        String userId = extractUserId(authentication);
        return ResponseEntity.ok(transactionService.update(userId, id, request));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<TransactionResponse> patch(
            Authentication authentication,
            @PathVariable String id,
            @Valid @RequestBody UpdateTransactionRequest request) {
        String userId = extractUserId(authentication);
        return ResponseEntity.ok(transactionService.update(userId, id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            Authentication authentication,
            @PathVariable String id) {
        String userId = extractUserId(authentication);
        transactionService.delete(userId, id);
    }

    private String extractUserId(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("User is not authenticated");
        }
        Object principal = authentication.getPrincipal();
        if (principal instanceof CustomOAuth2User) {
            return ((CustomOAuth2User) principal).getUserId();
        } else if (principal instanceof OidcUser) {
            return (String) ((OidcUser) principal).getAttributes().get("userId");
        }
        throw new IllegalStateException("Unable to extract user ID from authentication");
    }

    private Sort parseSort(String sortParam) {
        if (sortParam == null || sortParam.isBlank()) {
            return Sort.by(Sort.Direction.DESC, "transactionDate");
        }
        String[] parts = sortParam.split(",");
        String field = parts[0].trim();
        String javaField = switch (field) {
            case "transaction_date" -> "transactionDate";
            case "created_at"       -> "createdAt";
            case "amount"           -> "amount";
            case "title"            -> "title";
            default                 -> "transactionDate";
        };
        Sort.Direction direction = (parts.length > 1 && "asc".equalsIgnoreCase(parts[1].trim()))
            ? Sort.Direction.ASC : Sort.Direction.DESC;
        return Sort.by(direction, javaField);
    }
}
