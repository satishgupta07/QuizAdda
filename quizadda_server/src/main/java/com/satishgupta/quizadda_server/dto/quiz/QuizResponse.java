package com.satishgupta.quizadda_server.dto.quiz;

import com.satishgupta.quizadda_server.dto.category.CategoryResponse;

public record QuizResponse(
        Long quizId,
        String title,
        String description,
        String maxMarks,
        String numberOfQuestions,
        boolean active,
        CategoryResponse category
) {
}
