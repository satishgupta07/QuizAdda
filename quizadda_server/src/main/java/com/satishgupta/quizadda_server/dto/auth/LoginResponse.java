package com.satishgupta.quizadda_server.dto.auth;

import com.satishgupta.quizadda_server.dto.user.UserResponse;

/**
 * Response returned after a successful login: the JWT plus the authenticated user's profile.
 */
public record LoginResponse(
        String token,
        UserResponse user
) {
}
