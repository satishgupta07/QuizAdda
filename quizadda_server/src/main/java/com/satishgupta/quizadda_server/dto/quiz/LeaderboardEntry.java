package com.satishgupta.quizadda_server.dto.quiz;

import java.time.Instant;

/**
 * Single row in a quiz leaderboard. Includes only the username (no email or
 * other PII) — leaderboards may be visible to other users.
 */
public record LeaderboardEntry(
        int rank,
        String username,
        double marksGot,
        int correctAnswers,
        int totalQuestions,
        Instant attemptedAt
) {
}
