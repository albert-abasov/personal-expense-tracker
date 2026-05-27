package com.example.personalexpensetracker.budget;

import java.math.BigDecimal;
import java.time.Instant;

public record BudgetResponse(
    String id,
    String userId,
    int year,
    int month,
    BigDecimal amount,
    String currency,
    Instant createdAt
) {
    public static BudgetResponse from(MonthlyBudget budget) {
        return new BudgetResponse(
            budget.getId(),
            budget.getUserId(),
            budget.getYear(),
            budget.getMonth(),
            budget.getAmount(),
            budget.getCurrency(),
            budget.getCreatedAt()
        );
    }
}
