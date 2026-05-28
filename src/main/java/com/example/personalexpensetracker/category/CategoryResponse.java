package com.example.personalexpensetracker.category;

import java.time.Instant;

public record CategoryResponse(
    String id,
    String name,
    Instant createdAt
) {
    public static CategoryResponse from(Category category) {
        return new CategoryResponse(
            category.getId(),
            category.getName(),
            category.getCreatedAt()
        );
    }
}
