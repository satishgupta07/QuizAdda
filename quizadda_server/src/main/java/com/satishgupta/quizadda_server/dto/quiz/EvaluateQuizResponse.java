package com.satishgupta.quizadda_server.dto.quiz;

public record EvaluateQuizResponse(
        double marksGot,
        int correctAnswers,
        int attempted,
        int totalQuestions
) {
}
