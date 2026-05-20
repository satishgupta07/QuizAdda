package com.satishgupta.quizadda_server.dto.category;

public record CategoryResponse(
        Long catId,
        String title,
        String description
) {
}
