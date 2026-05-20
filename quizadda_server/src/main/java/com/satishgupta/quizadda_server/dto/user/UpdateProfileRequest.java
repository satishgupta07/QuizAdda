package com.satishgupta.quizadda_server.dto.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

/**
 * Editable subset of a user's profile. Username and roles are deliberately
 * NOT included — those are identity-bearing and shouldn't change via this
 * endpoint.
 */
public record UpdateProfileRequest(
        @NotBlank(message = "First name is required") String firstName,
        @NotBlank(message = "Last name is required")  String lastName,
        @NotBlank(message = "Email is required") @Email(message = "Email must be valid") String email,
        @Pattern(regexp = "^[0-9+\\-\\s]{0,20}$", message = "Phone must contain only digits, '+', '-' or spaces (max 20)")
        String phone
) {
}
