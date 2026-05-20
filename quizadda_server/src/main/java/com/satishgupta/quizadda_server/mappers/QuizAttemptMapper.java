package com.satishgupta.quizadda_server.mappers;

import com.satishgupta.quizadda_server.dto.quiz.LeaderboardEntry;
import com.satishgupta.quizadda_server.dto.quiz.QuizAttemptResponse;
import com.satishgupta.quizadda_server.models.QuizAttempt;

public final class QuizAttemptMapper {

    private QuizAttemptMapper() { }

    public static QuizAttemptResponse toResponse(QuizAttempt a) {
        return new QuizAttemptResponse(
                a.getId(),
                a.getQuiz().getQuizId(),
                a.getQuiz().getTitle(),
                a.getQuiz().getCategory() != null ? a.getQuiz().getCategory().getTitle() : null,
                a.getMarksGot(),
                a.getCorrectAnswers(),
                a.getAttempted(),
                a.getTotalQuestions(),
                a.getAttemptedAt()
        );
    }

    public static LeaderboardEntry toLeaderboardEntry(QuizAttempt a, int rank) {
        return new LeaderboardEntry(
                rank,
                a.getUser().getUsername(),
                a.getMarksGot(),
                a.getCorrectAnswers(),
                a.getTotalQuestions(),
                a.getAttemptedAt()
        );
    }
}
