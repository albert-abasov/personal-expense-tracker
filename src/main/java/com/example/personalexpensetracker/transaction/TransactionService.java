package com.example.personalexpensetracker.transaction;

import com.example.personalexpensetracker.category.CategoryRepository;
import com.example.personalexpensetracker.common.NotFoundException;
import com.example.personalexpensetracker.common.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public PageResponse<TransactionResponse> list(String userId, TransactionListParams params, Pageable pageable) {
        Specification<Transaction> spec = buildSpec(userId, params);
        Page<TransactionResponse> page = transactionRepository
            .findAll(spec, pageable)
            .map(TransactionResponse::from);
        return PageResponse.of(page);
    }

    @Transactional(readOnly = true)
    public TransactionResponse getOne(String userId, String id) {
        return transactionRepository.findByIdAndUserId(id, userId)
            .map(TransactionResponse::from)
            .orElseThrow(() -> new NotFoundException("Transaction not found"));
    }

    public TransactionResponse create(String userId, CreateTransactionRequest req) {
        categoryRepository.findByIdAndUserId(req.categoryId(), userId)
            .orElseThrow(() -> new NotFoundException("Category not found"));

        Transaction t = Transaction.builder()
            .id(UUID.randomUUID().toString())
            .userId(userId)
            .categoryId(req.categoryId())
            .title(req.title())
            .amount(req.amount())
            .currency(req.currency())
            .transactionDate(req.transactionDate())
            .notes(req.notes())
            .build();

        return TransactionResponse.from(transactionRepository.save(t));
    }

    public TransactionResponse update(String userId, String id, UpdateTransactionRequest req) {
        Transaction t = transactionRepository.findByIdAndUserId(id, userId)
            .orElseThrow(() -> new NotFoundException("Transaction not found"));

        categoryRepository.findByIdAndUserId(req.categoryId(), userId)
            .orElseThrow(() -> new NotFoundException("Category not found"));

        t.setTitle(req.title());
        t.setAmount(req.amount());
        t.setCurrency(req.currency());
        t.setTransactionDate(req.transactionDate());
        t.setCategoryId(req.categoryId());
        t.setNotes(req.notes());

        return TransactionResponse.from(transactionRepository.save(t));
    }

    public void delete(String userId, String id) {
        Transaction t = transactionRepository.findByIdAndUserId(id, userId)
            .orElseThrow(() -> new NotFoundException("Transaction not found"));
        transactionRepository.delete(t);
    }

    private Specification<Transaction> buildSpec(String userId, TransactionListParams p) {
        LocalDate resolvedFrom = resolveFrom(p);
        LocalDate resolvedTo   = resolveTo(p);

        Specification<Transaction> spec = Specification.where(TransactionFilters.forUser(userId));

        Specification<Transaction> search = TransactionFilters.searchQuery(p.q());
        if (search != null) spec = spec.and(search);

        Specification<Transaction> category = TransactionFilters.forCategory(p.categoryId());
        if (category != null) spec = spec.and(category);

        Specification<Transaction> from = TransactionFilters.dateFrom(resolvedFrom);
        if (from != null) spec = spec.and(from);

        Specification<Transaction> to = TransactionFilters.dateTo(resolvedTo);
        if (to != null) spec = spec.and(to);

        Specification<Transaction> minAmount = TransactionFilters.amountMin(p.amountMin());
        if (minAmount != null) spec = spec.and(minAmount);

        Specification<Transaction> maxAmount = TransactionFilters.amountMax(p.amountMax());
        if (maxAmount != null) spec = spec.and(maxAmount);

        return spec;
    }

    private LocalDate resolveFrom(TransactionListParams p) {
        if ("this_month".equals(p.dateRange())) {
            return LocalDate.now().withDayOfMonth(1);
        } else if ("last_month".equals(p.dateRange())) {
            return LocalDate.now().minusMonths(1).withDayOfMonth(1);
        }
        return p.dateFrom();
    }

    private LocalDate resolveTo(TransactionListParams p) {
        if ("this_month".equals(p.dateRange())) {
            return LocalDate.now();
        } else if ("last_month".equals(p.dateRange())) {
            LocalDate last = LocalDate.now().minusMonths(1);
            return last.withDayOfMonth(last.lengthOfMonth());
        }
        return p.dateTo();
    }
}
