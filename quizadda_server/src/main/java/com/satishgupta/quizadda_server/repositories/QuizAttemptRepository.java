package com.satishgupta.quizadda_server.repositories;

import com.satishgupta.quizadda_server.models.QuizAttempt;
import com.satishgupta.quizadda_server.models.User;
import com.satishgupta.quizadda_server.models.quizPortal.Quiz;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {

    /** Paginated history of a user's attempts, newest first. */
    Page<QuizAttempt> findByUserOrderByAttemptedAtDesc(User user, Pageable pageable);

    /** Top scores for a quiz, ordered for leaderboard display. */
    List<QuizAttempt> findTop10ByQuizOrderByMarksGotDescAttemptedAtAsc(Quiz quiz);

    long countByQuiz(Quiz quiz);
}
