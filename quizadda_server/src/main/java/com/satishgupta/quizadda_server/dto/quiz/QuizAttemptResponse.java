package com.satishgupta.quizadda_server.dto.quiz;

import java.time.Instant;

/**
 * Single row in a user's attempt history.
 */
public record QuizAttemptResponse(
        Long id,
        Long quizId,
        String quizTitle,
        String categoryTitle,
        double marksGot,
        int correctAnswers,
        int attempted,
        int totalQuestions,
        Instant attemptedAt
) {
}
