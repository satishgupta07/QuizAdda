package com.satishgupta.quizadda_server.models;

import com.satishgupta.quizadda_server.models.quizPortal.Quiz;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/**
 * Record of one user's attempt at one quiz. Persisted by
 * {@code QuizService.evaluateQuiz} so the user can review history and the
 * server can build per-quiz leaderboards + admin analytics.
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(
        name = "quiz_attempts",
        indexes = {
                @Index(name = "idx_attempts_user",           columnList = "user_id"),
                @Index(name = "idx_attempts_quiz_marks",     columnList = "quiz_id, marks_got DESC"),
                @Index(name = "idx_attempts_user_attempted", columnList = "user_id, attempted_at DESC")
        }
)
public class QuizAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    @Column(name = "marks_got", nullable = false)
    private double marksGot;

    @Column(name = "correct_answers", nullable = false)
    private int correctAnswers;

    @Column(name = "attempted", nullable = false)
    private int attempted;

    @Column(name = "total_questions", nullable = false)
    private int totalQuestions;

    @Column(name = "attempted_at", nullable = false)
    private Instant attemptedAt;
}
