package com.example.personalexpensetracker.category;

import jakarta.validation.constraints.Size;

public record UpdateCategoryRequest(
    @Size(max = 100) String name
) {}
