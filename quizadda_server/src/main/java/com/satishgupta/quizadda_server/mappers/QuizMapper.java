package com.satishgupta.quizadda_server.mappers;

import com.satishgupta.quizadda_server.dto.quiz.QuizResponse;
import com.satishgupta.quizadda_server.models.quizPortal.Quiz;

import java.util.LinkedHashSet;
import java.util.Set;

public final class QuizMapper {

    private QuizMapper() { }

    public static QuizResponse toResponse(Quiz q) {
        // Defensive copy: tags is a managed collection; expose it as an
        // unmodifiable snapshot so callers can't mutate persistent state.
        Set<String> tags = q.getTags() == null
                ? Set.of()
                : Set.copyOf(new LinkedHashSet<>(q.getTags()));

        return new QuizResponse(
                q.getQuizId(),
                q.getTitle(),
                q.getDescription(),
                q.getMaxMarks(),
                q.getNumberOfQuestions(),
                q.isActive(),
                q.getDifficulty(),
                tags,
                CategoryMapper.toResponse(q.getCategory())
        );
    }
}
