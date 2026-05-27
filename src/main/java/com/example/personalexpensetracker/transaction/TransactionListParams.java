package com.example.personalexpensetracker.transaction;

import java.math.BigDecimal;
import java.time.LocalDate;

public record TransactionListParams(
    String q,
    String categoryId,
    String dateRange,
    LocalDate dateFrom,
    LocalDate dateTo,
    BigDecimal amountMin,
    BigDecimal amountMax
) {}
