package com.satishgupta.quizadda_server.mappers;

import com.satishgupta.quizadda_server.dto.quiz.QuizResponse;
import com.satishgupta.quizadda_server.models.quizPortal.Quiz;

public final class QuizMapper {

    private QuizMapper() { }

    public static QuizResponse toResponse(Quiz q) {
        return new QuizResponse(
                q.getQuizId(),
                q.getTitle(),
                q.getDescription(),
                q.getMaxMarks(),
                q.getNumberOfQuestions(),
                q.isActive(),
                CategoryMapper.toResponse(q.getCategory())
        );
    }
}
