package com.satishgupta.quizadda_server.dto.auth;

import jakarta.validation.constraints.NotBlank;

/**
 * Payload for the {@code POST /api/v1/auth/login} endpoint.
 */
public record LoginRequest(
        @NotBlank(message = "Username is required") String username,
        @NotBlank(message = "Password is required") String password
) {
}
