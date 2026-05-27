package com.example.personalexpensetracker.common;

import org.springframework.data.domain.Page;

import java.util.List;

public record PageResponse<T>(List<T> data, int page, int size, long total) {

    public static <T> PageResponse<T> of(Page<T> page) {
        return new PageResponse<>(
            page.getContent(),
            page.getNumber(),
            page.getSize(),
            page.getTotalElements()
        );
    }
}
