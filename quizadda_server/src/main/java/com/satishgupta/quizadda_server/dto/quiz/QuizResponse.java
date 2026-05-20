package com.satishgupta.quizadda_server.dto.quiz;

import com.satishgupta.quizadda_server.dto.category.CategoryResponse;
import com.satishgupta.quizadda_server.models.quizPortal.Difficulty;

import java.util.Set;

public record QuizResponse(
        Long quizId,
        String title,
        String description,
        String maxMarks,
        String numberOfQuestions,
        boolean active,
        Difficulty difficulty,
        Set<String> tags,
        CategoryResponse category
) {
}
