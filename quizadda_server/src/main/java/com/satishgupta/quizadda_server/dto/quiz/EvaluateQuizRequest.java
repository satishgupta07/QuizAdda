package com.satishgupta.quizadda_server.dto.quiz;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

/**
 * Payload for {@code POST /api/v1/quizzes/{quizId}/evaluate}. Carries the user's
 * chosen answer for each question; the server is the source of truth for the actual
 * correct answer (never trusted from the client).
 */
public record EvaluateQuizRequest(
        @NotEmpty(message = "Answers list cannot be empty")
        @Valid
        List<Answer> answers
) {
    public record Answer(
            @NotNull(message = "Question id is required") Long quesId,
            String chosenAnswer
    ) {
    }
}
