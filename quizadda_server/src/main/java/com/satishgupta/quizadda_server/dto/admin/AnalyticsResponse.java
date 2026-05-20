package com.satishgupta.quizadda_server.dto.admin;

import java.util.List;

/**
 * High-level metrics for the admin analytics dashboard. Designed to be fetched
 * in one round trip — components nested inside.
 */
public record AnalyticsResponse(
        long totalUsers,
        long totalCategories,
        long totalQuizzes,
        long activeQuizzes,
        long totalQuestions,
        long totalAttempts,
        List<QuizStats> topQuizzes
) {

    /** Per-quiz roll-up used for the "top quizzes" table. */
    public record QuizStats(
            Long quizId,
            String quizTitle,
            String categoryTitle,
            long attemptCount,
            double averageScore
    ) {
    }
}
