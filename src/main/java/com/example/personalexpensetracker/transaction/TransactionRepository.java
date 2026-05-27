package com.example.personalexpensetracker.transaction;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TransactionRepository
        extends JpaRepository<Transaction, String>,
                JpaSpecificationExecutor<Transaction> {

    boolean existsByCategoryIdAndUserId(String categoryId, String userId);

    Optional<Transaction> findByIdAndUserId(String id, String userId);
}
