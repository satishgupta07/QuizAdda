package com.satishgupta.quizadda_server.services;

import com.satishgupta.quizadda_server.dto.quiz.EvaluateQuizRequest;
import com.satishgupta.quizadda_server.dto.quiz.EvaluateQuizResponse;
import com.satishgupta.quizadda_server.dto.quiz.QuizRequest;
import com.satishgupta.quizadda_server.dto.quiz.QuizResponse;
import com.satishgupta.quizadda_server.models.quizPortal.Quiz;

import java.util.List;

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
}
