package com.satishgupta.quizadda_server.services;

import com.satishgupta.quizadda_server.models.quizPortal.Category;
import com.satishgupta.quizadda_server.models.quizPortal.Quiz;

import java.util.List;

public interface QuizService {

    public Quiz addQuiz(Quiz quiz);

    public Quiz updateQuiz(Quiz quiz);

    public List<Quiz> getQuizzes();

    public Quiz getQuiz(Long quizId);

    public void deleteQuiz(Long quizId);

    public List<Quiz> getQuizzesOfCategory(Category category);

    public List<Quiz> getActiveQuizzes(Boolean active);

    public List<Quiz> getActiveQuizzesOfCategory(Category category, Boolean active);
}
