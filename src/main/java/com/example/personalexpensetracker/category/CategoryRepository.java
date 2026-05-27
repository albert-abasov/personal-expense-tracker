package com.example.personalexpensetracker.category;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, String> {
    List<Category> findByUserIdOrderByNameAsc(String userId);

    Optional<Category> findByIdAndUserId(String id, String userId);

    boolean existsByNameAndUserId(String name, String userId);

    boolean existsByNameAndUserIdAndIdNot(String name, String userId, String id);
}
