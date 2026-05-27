package com.example.personalexpensetracker.transaction;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record TransactionResponse(
    String id,
    String categoryId,
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
            t.getId(),
            t.getCategoryId(),
            t.getCategory() != null ? t.getCategory().getName() : "Unknown",
            t.getTitle(),
            t.getAmount(),
            t.getCurrency(),
            t.getTransactionDate(),
            t.getNotes(),
            t.getCreatedAt(),
            t.getUpdatedAt()
        );
    }
}
