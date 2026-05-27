package com.example.personalexpensetracker.transaction;

import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.LocalDate;

public class TransactionFilters {

    public static Specification<Transaction> forUser(String userId) {
        return (root, query, cb) -> cb.equal(root.get("userId"), userId);
    }

    public static Specification<Transaction> searchQuery(String q) {
        if (q == null || q.isBlank()) return null;
        String pattern = "%" + q.toLowerCase() + "%";
        return (root, query, cb) -> cb.or(
            cb.like(cb.lower(root.get("title")), pattern),
            cb.like(cb.lower(root.get("notes")), pattern)
        );
    }

    public static Specification<Transaction> forCategory(String categoryId) {
        if (categoryId == null || categoryId.isBlank()) return null;
        return (root, query, cb) -> cb.equal(root.get("categoryId"), categoryId);
    }

    public static Specification<Transaction> dateFrom(LocalDate from) {
        if (from == null) return null;
        return (root, query, cb) ->
            cb.greaterThanOrEqualTo(root.get("transactionDate"), from);
    }

    public static Specification<Transaction> dateTo(LocalDate to) {
        if (to == null) return null;
        return (root, query, cb) ->
            cb.lessThanOrEqualTo(root.get("transactionDate"), to);
    }

    public static Specification<Transaction> amountMin(BigDecimal min) {
        if (min == null) return null;
        return (root, query, cb) ->
            cb.greaterThanOrEqualTo(root.get("amount"), min);
    }

    public static Specification<Transaction> amountMax(BigDecimal max) {
        if (max == null) return null;
        return (root, query, cb) ->
            cb.lessThanOrEqualTo(root.get("amount"), max);
    }
}
