package com.satishgupta.quizadda_server.mappers;

import com.satishgupta.quizadda_server.dto.question.QuestionResponse;
import com.satishgupta.quizadda_server.models.quizPortal.Question;

public final class QuestionMapper {

    private QuestionMapper() { }

    /** Full response, including the correct answer. Admin/owner views only. */
    public static QuestionResponse toResponse(Question q) {
        return new QuestionResponse(
                q.getQuesId(),
                q.getContent(),
                q.getImage(),
                q.getOption1(),
                q.getOption2(),
                q.getOption3(),
                q.getOption4(),
                q.getAnswer(),
                q.getQuiz() != null ? q.getQuiz().getQuizId() : null
        );
    }

    /** Response for quiz-taking flow — strips the answer so the client can't cheat. */
    public static QuestionResponse toUserResponse(Question q) {
        return new QuestionResponse(
                q.getQuesId(),
                q.getContent(),
                q.getImage(),
                q.getOption1(),
                q.getOption2(),
                q.getOption3(),
                q.getOption4(),
                null,
                q.getQuiz() != null ? q.getQuiz().getQuizId() : null
        );
    }
}
