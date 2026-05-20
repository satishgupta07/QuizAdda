package com.satishgupta.quizadda_server.services;

import com.satishgupta.quizadda_server.dto.PageResponse;
import com.satishgupta.quizadda_server.dto.quiz.EvaluateQuizRequest;
import com.satishgupta.quizadda_server.dto.quiz.EvaluateQuizResponse;
import com.satishgupta.quizadda_server.dto.quiz.LeaderboardEntry;
import com.satishgupta.quizadda_server.dto.quiz.QuizAttemptResponse;
import com.satishgupta.quizadda_server.dto.quiz.QuizRequest;
import com.satishgupta.quizadda_server.dto.quiz.QuizResponse;
import com.satishgupta.quizadda_server.models.quizPortal.Quiz;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * Business operations on quizzes, including the authoritative evaluation flow.
 * Evaluation scoring uses the server's stored answers — the request's
 * {@code chosenAnswer} values are the only client-trusted input. Every
 * evaluation also persists a {@code QuizAttempt} so users can review history
 * and admins can build analytics.
 */
public interface QuizService {

    QuizResponse addQuiz(QuizRequest request);

    QuizResponse updateQuiz(Long quizId, QuizRequest request);

    List<QuizResponse> getQuizzes();

    QuizResponse getQuiz(Long quizId);

    /** Internal accessor for use by other services (returns the JPA entity). */
    Quiz getQuizEntity(Long quizId);

    void deleteQuiz(Long quizId);

    List<QuizResponse> getQuizzesOfCategory(Long categoryId);

    List<QuizResponse> getActiveQuizzes();

    List<QuizResponse> getActiveQuizzesOfCategory(Long categoryId);

    EvaluateQuizResponse evaluateQuiz(Long quizId, EvaluateQuizRequest request);

    /** Caller's own attempt history, paginated newest-first. */
    PageResponse<QuizAttemptResponse> getMyAttempts(Pageable pageable);

    /** Top 10 attempts for a quiz across all users. */
    List<LeaderboardEntry> getLeaderboard(Long quizId);
}
