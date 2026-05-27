package com.example.personalexpensetracker.category;

import java.time.Instant;

public record CategoryResponse(
    String id,
    String name,
    String color,
    Instant createdAt
) {
    public static CategoryResponse from(Category category) {
        return new CategoryResponse(
            category.getId(),
            category.getName(),
            category.getColor(),
            category.getCreatedAt()
        );
    }
}
