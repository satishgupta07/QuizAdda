package com.satishgupta.quizadda_server.dto.user;

import java.util.Set;

/**
 * Safe view of a user for API responses; deliberately omits {@code password} and other
 * UserDetails-derived booleans that the client does not need.
 */
public record UserResponse(
        Long id,
        String username,
        String firstName,
        String lastName,
        String email,
        String phone,
        String profile,
        boolean enabled,
        Set<String> authorities
) {
}
