package com.example.personalexpensetracker.transaction;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface TransactionRepository
        extends JpaRepository<Transaction, String>,
                JpaSpecificationExecutor<Transaction> {

    boolean existsByCategoryIdAndUserId(String categoryId, String userId);

    Optional<Transaction> findByIdAndUserId(String id, String userId);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.userId = :userId AND t.transactionDate >= :startDate AND t.transactionDate < :endDate")
    BigDecimal sumAmountByUserAndDateRange(@Param("userId") String userId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
