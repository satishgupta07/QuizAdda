package com.satishgupta.quizadda_server.dto;

import org.springframework.data.domain.Page;

import java.util.List;

/**
 * Slimmed-down paged response — keeps clients off Spring Data's full
 * {@code Page<T>} shape (which leaks pageable/sort internals).
 */
public record PageResponse<T>(
        List<T> content,
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean last
) {
    public static <T> PageResponse<T> from(Page<T> page) {
        return new PageResponse<>(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isLast()
        );
    }
}
