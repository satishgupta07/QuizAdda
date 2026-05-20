package com.satishgupta.quizadda_server.dto.question;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * Question response payload. The {@code answer} field is intentionally omitted from
 * the JSON when null so that user-facing endpoints (e.g. random quiz questions) can
 * return questions without leaking the correct answer.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record QuestionResponse(
        Long quesId,
        String content,
        String image,
        String option1,
        String option2,
        String option3,
        String option4,
        String answer,
        Long quizId
) {
}
