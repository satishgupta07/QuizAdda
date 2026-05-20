package com.satishgupta.quizadda_server.services;

import com.satishgupta.quizadda_server.dto.question.QuestionRequest;
import com.satishgupta.quizadda_server.dto.question.QuestionResponse;

import java.util.List;

public interface QuestionService {

    QuestionResponse addQuestion(QuestionRequest request);

    QuestionResponse updateQuestion(Long questionId, QuestionRequest request);

    List<QuestionResponse> getQuestions();

    QuestionResponse getQuestion(Long questionId);

    /** Admin-facing list of questions for a quiz (includes the correct answer). */
    List<QuestionResponse> getQuestionsOfQuiz(Long quizId);

    /** User-facing random subset for taking the quiz (answer field is stripped). */
    List<QuestionResponse> getRandomQuestionsForUser(Long quizId);

    void deleteQuestion(Long questionId);
}
