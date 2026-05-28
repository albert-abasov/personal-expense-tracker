package com.example.personalexpensetracker.websocket;

import com.example.personalexpensetracker.budget.BudgetSummaryResponse;

import java.math.BigDecimal;

public record BudgetAlertMessage(
    String type,
    Integer threshold,
    Double usagePercent,
    BigDecimal totalSpent,
    BigDecimal budgetAmount,
    String currency,
    Integer year,
    Integer month
) {
    public static BudgetAlertMessage connected() {
        return new BudgetAlertMessage("CONNECTED", null, null, null, null, null, null, null);
    }

    public static BudgetAlertMessage alert(int threshold, BudgetSummaryResponse summary) {
        return new BudgetAlertMessage(
            "BUDGET_ALERT",
            threshold,
            summary.usagePercent(),
            summary.totalSpent(),
            summary.budgetAmount(),
            summary.currency(),
            summary.year(),
            summary.month()
        );
    }
}
