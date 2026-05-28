package com.example.personalexpensetracker.category;

import com.example.personalexpensetracker.common.ConflictException;
import com.example.personalexpensetracker.common.NotFoundException;
import com.example.personalexpensetracker.transaction.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;

    @Transactional(readOnly = true)
    public List<CategoryResponse> list(String userId) {
        return categoryRepository.findByUserIdOrderByNameAsc(userId)
            .stream()
            .map(CategoryResponse::from)
            .toList();
    }

    @Transactional(readOnly = true)
    public CategoryResponse getOne(String userId, String id) {
        return categoryRepository.findByIdAndUserId(id, userId)
            .map(CategoryResponse::from)
            .orElseThrow(() -> new NotFoundException("Category not found"));
    }

    public CategoryResponse create(String userId, CreateCategoryRequest req) {
        if (categoryRepository.existsByNameAndUserId(req.name(), userId)) {
            throw new ConflictException("Category name already exists for this user");
        }

        Category category = Category.builder()
            .id(UUID.randomUUID().toString())
            .userId(userId)
            .name(req.name())
            .createdAt(Instant.now())
            .build();

        return CategoryResponse.from(categoryRepository.save(category));
    }

    public CategoryResponse update(String userId, String id, UpdateCategoryRequest req) {
        Category category = categoryRepository.findByIdAndUserId(id, userId)
            .orElseThrow(() -> new NotFoundException("Category not found"));

        if (req.name() != null && !req.name().isEmpty()) {
            if (categoryRepository.existsByNameAndUserIdAndIdNot(req.name(), userId, id)) {
                throw new ConflictException("Category name already exists for this user");
            }
            category.setName(req.name());
        }

        return CategoryResponse.from(categoryRepository.save(category));
    }

    public void delete(String userId, String id) {
        Category category = categoryRepository.findByIdAndUserId(id, userId)
            .orElseThrow(() -> new NotFoundException("Category not found"));

        if (transactionRepository.existsByCategoryIdAndUserId(id, userId)) {
            throw new ConflictException("Category has associated transactions. Reassign or delete them first.");
        }

        categoryRepository.delete(category);
    }
}
