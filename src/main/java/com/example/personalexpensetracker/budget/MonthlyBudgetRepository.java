package com.example.personalexpensetracker.budget;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MonthlyBudgetRepository extends JpaRepository<MonthlyBudget, String> {

    List<MonthlyBudget> findByUserIdOrderByYearDescMonthDesc(String userId);

    Optional<MonthlyBudget> findByUserIdAndYearAndMonth(String userId, int year, int month);

    void deleteByUserIdAndYearAndMonth(String userId, int year, int month);

    boolean existsByUserIdAndYearAndMonth(String userId, int year, int month);
}
