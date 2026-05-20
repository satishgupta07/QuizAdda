package com.satishgupta.quizadda_server.services.impl;

import com.satishgupta.quizadda_server.dto.quiz.EvaluateQuizRequest;
import com.satishgupta.quizadda_server.dto.quiz.EvaluateQuizResponse;
import com.satishgupta.quizadda_server.models.QuizAttempt;
import com.satishgupta.quizadda_server.models.User;
import com.satishgupta.quizadda_server.models.quizPortal.Question;
import com.satishgupta.quizadda_server.models.quizPortal.Quiz;
import com.satishgupta.quizadda_server.repositories.CategoryRepository;
import com.satishgupta.quizadda_server.repositories.QuestionRepository;
import com.satishgupta.quizadda_server.repositories.QuizAttemptRepository;
import com.satishgupta.quizadda_server.repositories.QuizRepository;
import com.satishgupta.quizadda_server.services.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Verifies the scoring math + that an attempt is persisted on evaluation.
 * The full QuizServiceImpl is exercised; the repositories are mocked.
 */
@ExtendWith(MockitoExtension.class)
class QuizServiceImplEvaluateTest {

    @Mock QuizRepository quizRepository;
    @Mock CategoryRepository categoryRepository;
    @Mock QuestionRepository questionRepository;
    @Mock QuizAttemptRepository quizAttemptRepository;
    @Mock UserService userService;

    @InjectMocks QuizServiceImpl service;

    private final User testUser = new User();
    private final Quiz quiz = new Quiz();

    @BeforeEach
    void setUp() {
        testUser.setId(7L);
        testUser.setUsername("alice");

        quiz.setQuizId(1L);
        quiz.setMaxMarks("10");
        quiz.setNumberOfQuestions("4");

        // Stub a logged-in principal so currentUser() in QuizServiceImpl resolves.
        SecurityContext ctx = SecurityContextHolder.createEmptyContext();
        ctx.setAuthentication(new UsernamePasswordAuthenticationToken(testUser, null, List.of()));
        SecurityContextHolder.setContext(ctx);

        when(quizRepository.findById(1L)).thenReturn(Optional.of(quiz));
    }

    @Test
    void scoresOnlyCorrectAnswers() {
        Question q1 = question(101L, "Paris");
        Question q2 = question(102L, "Mars");
        Question q3 = question(103L, "C#");
        Question q4 = question(104L, "Trace");

        when(questionRepository.findByQuiz(quiz)).thenReturn(List.of(q1, q2, q3, q4));

        EvaluateQuizRequest req = new EvaluateQuizRequest(List.of(
                new EvaluateQuizRequest.Answer(101L, "Paris"),   // correct
                new EvaluateQuizRequest.Answer(102L, "Earth"),   // wrong (still counts as attempted)
                new EvaluateQuizRequest.Answer(103L, ""),        // skipped
                new EvaluateQuizRequest.Answer(104L, "Trace")    // correct
        ));

        EvaluateQuizResponse result = service.evaluateQuiz(1L, req);

        // 10 marks / 4 questions = 2.5 marks per correct answer; 2 correct => 5.0
        assertThat(result.marksGot()).isEqualTo(5.0);
        assertThat(result.correctAnswers()).isEqualTo(2);
        assertThat(result.attempted()).isEqualTo(3);
        assertThat(result.totalQuestions()).isEqualTo(4);

        // Verify the attempt was persisted — the audit log feature depends on it.
        verify(quizAttemptRepository).save(any(QuizAttempt.class));
    }

    private Question question(long id, String answer) {
        Question q = new Question();
        q.setQuesId(id);
        q.setAnswer(answer);
        q.setQuiz(quiz);
        return q;
    }
}
