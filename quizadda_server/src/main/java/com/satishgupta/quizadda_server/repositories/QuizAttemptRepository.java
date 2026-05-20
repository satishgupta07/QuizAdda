package com.satishgupta.quizadda_server.repositories;

import com.satishgupta.quizadda_server.models.QuizAttempt;
import com.satishgupta.quizadda_server.models.User;
import com.satishgupta.quizadda_server.models.quizPortal.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {

    /** A user's most recent attempts, newest first. Capped at 50 to keep responses small. */
    List<QuizAttempt> findTop50ByUserOrderByAttemptedAtDesc(User user);

    /** Top scores for a quiz, ordered for leaderboard display. */
    List<QuizAttempt> findTop10ByQuizOrderByMarksGotDescAttemptedAtAsc(Quiz quiz);

    long countByQuiz(Quiz quiz);
}
