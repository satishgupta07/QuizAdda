package com.satishgupta.quizadda_server.dto.quiz;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record QuizRequest(
        @NotBlank(message = "Title is required")
        @Size(max = 150, message = "Title must be at most 150 characters")
        String title,

        @Size(max = 1000, message = "Description must be at most 1000 characters")
        String description,

        @NotBlank(message = "Max marks is required")
        @Pattern(regexp = "^\\d+(\\.\\d+)?$", message = "Max marks must be numeric")
        String maxMarks,

        @NotBlank(message = "Number of questions is required")
        @Pattern(regexp = "^\\d+$", message = "Number of questions must be an integer")
        String numberOfQuestions,

        boolean active,

        @NotNull(message = "Category id is required")
        Long categoryId
) {
}
