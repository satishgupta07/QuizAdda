package com.satishgupta.quizadda_server.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.List;

/**
 * Standard JSON error payload returned by {@code GlobalExceptionHandler}.
 * Keeps client-facing error responses consistent across the API.
 */
@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiError {

    private final Instant timestamp;
    private final int status;
    private final String error;
    private final String message;
    private final String path;

    /** Field-level errors for HTTP 400 validation failures. */
    private final List<FieldViolation> violations;

    @Getter
    @Builder
    public static class FieldViolation {
        private final String field;
        private final String message;
    }
}
