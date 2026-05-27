package com.example.personalexpensetracker.budget;

import com.example.personalexpensetracker.auth.CustomOAuth2User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/budgets")
@RequiredArgsConstructor
public class MonthlyBudgetController {

    private final MonthlyBudgetService budgetService;

    @GetMapping
    public ResponseEntity<List<BudgetResponse>> getAllBudgets(Authentication authentication) {
        String userId = extractUserId(authentication);
        return ResponseEntity.ok(budgetService.getAllBudgets(userId));
    }

    @GetMapping("/{year}/{month}")
    public ResponseEntity<BudgetResponse> getBudget(
        Authentication authentication,
        @PathVariable int year,
        @PathVariable int month) {
        String userId = extractUserId(authentication);
        return ResponseEntity.ok(budgetService.getBudget(userId, year, month));
    }

    @PutMapping("/{year}/{month}")
    public ResponseEntity<BudgetResponse> upsertBudget(
        Authentication authentication,
        @PathVariable int year,
        @PathVariable int month,
        @Valid @RequestBody UpsertBudgetRequest request) {
        String userId = extractUserId(authentication);
        BudgetResponse response = budgetService.upsertBudget(userId, year, month, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{year}/{month}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteBudget(
        Authentication authentication,
        @PathVariable int year,
        @PathVariable int month) {
        String userId = extractUserId(authentication);
        budgetService.deleteBudget(userId, year, month);
    }

    @GetMapping("/{year}/{month}/summary")
    public ResponseEntity<BudgetSummaryResponse> getBudgetSummary(
        Authentication authentication,
        @PathVariable int year,
        @PathVariable int month) {
        String userId = extractUserId(authentication);
        return ResponseEntity.ok(budgetService.getBudgetSummary(userId, year, month));
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
}
