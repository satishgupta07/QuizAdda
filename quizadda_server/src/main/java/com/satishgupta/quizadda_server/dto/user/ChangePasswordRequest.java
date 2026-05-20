package com.satishgupta.quizadda_server.dto.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Password change requires proof of the current password — defends against
 * session hijacking turning into permanent account takeover.
 */
public record ChangePasswordRequest(
        @NotBlank(message = "Current password is required") String currentPassword,
        @NotBlank(message = "New password is required")
        @Size(min = 4, max = 100, message = "New password must be between 4 and 100 characters")
        String newPassword
) {
}
