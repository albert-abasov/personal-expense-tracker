package com.example.personalexpensetracker.budget;

import com.example.personalexpensetracker.common.NotFoundException;
import com.example.personalexpensetracker.transaction.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class MonthlyBudgetService {

    private final MonthlyBudgetRepository budgetRepository;
    private final TransactionRepository transactionRepository;

    @Transactional(readOnly = true)
    public List<BudgetResponse> getAllBudgets(String userId) {
        return budgetRepository.findByUserIdOrderByYearDescMonthDesc(userId)
            .stream()
            .map(BudgetResponse::from)
            .toList();
    }

    @Transactional(readOnly = true)
    public BudgetResponse getBudget(String userId, int year, int month) {
        return budgetRepository.findByUserIdAndYearAndMonth(userId, year, month)
            .map(BudgetResponse::from)
            .orElseThrow(() -> new NotFoundException("Budget not found for the specified month"));
    }

    public BudgetResponse upsertBudget(String userId, int year, int month, UpsertBudgetRequest request) {
        var existing = budgetRepository.findByUserIdAndYearAndMonth(userId, year, month);

        MonthlyBudget budget;
        if (existing.isPresent()) {
            budget = existing.get();
            budget.setAmount(request.amount());
            budget.setCurrency(request.currency());
        } else {
            budget = MonthlyBudget.builder()
                .id(UUID.randomUUID().toString())
                .userId(userId)
                .year(year)
                .month(month)
                .amount(request.amount())
                .currency(request.currency())
                .build();
        }

        return BudgetResponse.from(budgetRepository.save(budget));
    }

    public void deleteBudget(String userId, int year, int month) {
        var budget = budgetRepository.findByUserIdAndYearAndMonth(userId, year, month)
            .orElseThrow(() -> new NotFoundException("Budget not found for the specified month"));

        budgetRepository.deleteByUserIdAndYearAndMonth(userId, year, month);
    }

    @Transactional(readOnly = true)
    public BudgetSummaryResponse getBudgetSummary(String userId, int year, int month) {
        var budget = budgetRepository.findByUserIdAndYearAndMonth(userId, year, month);

        if (budget.isEmpty()) {
            return BudgetSummaryResponse.noBudget(year, month);
        }

        MonthlyBudget b = budget.get();

        // Calculate total spent for the month
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.plusMonths(1);
        BigDecimal totalSpent = transactionRepository.sumAmountByUserAndDateRange(userId, startDate, endDate);

        return BudgetSummaryResponse.withBudget(b, totalSpent);
    }
}
