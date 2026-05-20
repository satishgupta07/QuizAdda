package com.satishgupta.quizadda_server.dto.question;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record QuestionRequest(
        @NotBlank(message = "Content is required")
        @Size(max = 5000, message = "Content must be at most 5000 characters")
        String content,

        @Size(max = 500, message = "Image URL must be at most 500 characters")
        String image,

        @NotBlank(message = "Option 1 is required") String option1,
        @NotBlank(message = "Option 2 is required") String option2,
        @NotBlank(message = "Option 3 is required") String option3,
        @NotBlank(message = "Option 4 is required") String option4,

        @NotBlank(message = "Answer is required") String answer,

        @NotNull(message = "Quiz id is required") Long quizId
) {
}
