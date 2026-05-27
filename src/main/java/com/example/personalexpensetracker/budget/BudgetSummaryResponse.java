package com.example.personalexpensetracker.budget;

import java.math.BigDecimal;

public record BudgetSummaryResponse(
    int year,
    int month,
    String currency,
    BigDecimal budgetAmount,
    BigDecimal totalSpent,
    BigDecimal remaining,
    Double usagePercent,
    boolean hasBudget
) {
    public static BudgetSummaryResponse withBudget(MonthlyBudget budget, BigDecimal totalSpent) {
        BigDecimal remaining = budget.getAmount().subtract(totalSpent);
        double usagePercent = totalSpent.doubleValue() / budget.getAmount().doubleValue() * 100;
        // Round to 1 decimal place
        usagePercent = Math.round(usagePercent * 10.0) / 10.0;

        return new BudgetSummaryResponse(
            budget.getYear(),
            budget.getMonth(),
            budget.getCurrency(),
            budget.getAmount(),
            totalSpent,
            remaining,
            usagePercent,
            true
        );
    }

    public static BudgetSummaryResponse noBudget(int year, int month) {
        return new BudgetSummaryResponse(
            year,
            month,
            "USD",
            null,
            null,
            null,
            null,
            false
        );
    }
}
