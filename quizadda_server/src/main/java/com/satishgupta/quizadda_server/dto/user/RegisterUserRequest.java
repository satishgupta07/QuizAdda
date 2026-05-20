package com.satishgupta.quizadda_server.dto.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Payload for new-user registration. Validated by {@code @Valid} on the controller.
 */
public record RegisterUserRequest(
        @NotBlank(message = "Username is required")
        @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
        String username,

        @NotBlank(message = "Password is required")
        @Size(min = 4, max = 100, message = "Password must be between 4 and 100 characters")
        String password,

        @NotBlank(message = "First name is required")
        String firstName,

        @NotBlank(message = "Last name is required")
        String lastName,

        @NotBlank(message = "Email is required")
        @Email(message = "Email must be valid")
        String email,

        @Pattern(regexp = "^[0-9+\\-\\s]{0,20}$", message = "Phone must contain only digits, '+', '-' or spaces (max 20 chars)")
        String phone
) {
}
