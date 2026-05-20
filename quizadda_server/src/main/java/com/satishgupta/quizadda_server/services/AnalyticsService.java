package com.satishgupta.quizadda_server.services;

import com.satishgupta.quizadda_server.dto.admin.AnalyticsResponse;
import com.satishgupta.quizadda_server.models.QuizAttempt;
import com.satishgupta.quizadda_server.models.quizPortal.Quiz;
import com.satishgupta.quizadda_server.repositories.CategoryRepository;
import com.satishgupta.quizadda_server.repositories.QuestionRepository;
import com.satishgupta.quizadda_server.repositories.QuizAttemptRepository;
import com.satishgupta.quizadda_server.repositories.QuizRepository;
import com.satishgupta.quizadda_server.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Aggregates admin-facing metrics. Implementation favors simplicity over
 * scalability — runs in-process aggregations on full tables, fine for the
 * sizes this app handles. A production version would push aggregations into
 * SQL with proper indexes.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnalyticsService {

    /** Cap on rows returned in the "top quizzes" table. */
    private static final int TOP_QUIZZES_LIMIT = 5;

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final QuizAttemptRepository quizAttemptRepository;

    public AnalyticsResponse computeAnalytics() {
        long totalUsers      = userRepository.count();
        long totalCategories = categoryRepository.count();
        long totalQuizzes    = quizRepository.count();
        long activeQuizzes   = quizRepository.findByActive(true).size();
        long totalQuestions  = questionRepository.count();
        long totalAttempts   = quizAttemptRepository.count();

        List<AnalyticsResponse.QuizStats> topQuizzes = topQuizzesByAttempts();

        return new AnalyticsResponse(
                totalUsers, totalCategories, totalQuizzes, activeQuizzes,
                totalQuestions, totalAttempts, topQuizzes
        );
    }

    private List<AnalyticsResponse.QuizStats> topQuizzesByAttempts() {
        // Group attempts by quiz; compute count + average. Done in-memory so
        // adding new metrics later doesn't require new repository methods.
        Map<Quiz, List<QuizAttempt>> byQuiz = quizAttemptRepository.findAll().stream()
                .collect(Collectors.groupingBy(QuizAttempt::getQuiz));

        return byQuiz.entrySet().stream()
                .map(e -> {
                    Quiz quiz = e.getKey();
                    List<QuizAttempt> attempts = e.getValue();
                    double avg = attempts.stream()
                            .mapToDouble(QuizAttempt::getMarksGot)
                            .average()
                            .orElse(0.0);
                    return new AnalyticsResponse.QuizStats(
                            quiz.getQuizId(),
                            quiz.getTitle(),
                            quiz.getCategory() != null ? quiz.getCategory().getTitle() : null,
                            attempts.size(),
                            avg
                    );
                })
                .sorted(Comparator.comparingLong(AnalyticsResponse.QuizStats::attemptCount).reversed())
                .limit(TOP_QUIZZES_LIMIT)
                .toList();
    }
}
