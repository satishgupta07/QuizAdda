package com.satishgupta.quizadda_server.services;

import com.satishgupta.quizadda_server.models.quizPortal.Question;
import com.satishgupta.quizadda_server.models.quizPortal.Quiz;

import java.util.List;

public interface QuestionService {

    public Question addQuestion(Question question);

    public Question updateQuestion(Question question);

    public List<Question> getQuestions();

    public Question getQuestion(Long questionId);

    public List<Question> getQuestionsOfQuiz(Quiz quiz);

    public void deleteQuestion(Long quesId);

    public Question get(Long questionId);
}
