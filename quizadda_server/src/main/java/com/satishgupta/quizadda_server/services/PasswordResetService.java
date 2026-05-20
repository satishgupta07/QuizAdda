package com.satishgupta.quizadda_server.services;

import com.satishgupta.quizadda_server.exceptions.ResourceNotFoundException;
import com.satishgupta.quizadda_server.models.PasswordResetToken;
import com.satishgupta.quizadda_server.models.User;
import com.satishgupta.quizadda_server.repositories.PasswordResetTokenRepository;
import com.satishgupta.quizadda_server.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;

/**
 * Issues and validates single-use, time-limited password reset tokens. The
 * actual delivery is delegated to {@link EmailService} which currently logs
 * the message — swap for real SMTP in production.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class PasswordResetService {

    private static final int TOKEN_BYTES = 32;
    private static final long TTL_MINUTES = 30;

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    /** Public URL where the user lands to type a new password. */
    @Value("${app.frontend.password-reset-url:http://localhost:4200/reset-password}")
    private String resetUrl;

    /**
     * Always returns successfully even if the email isn't registered — leaking
     * "this email doesn't have an account" enables enumeration attacks. The
     * email is only sent if the account actually exists.
     */
    public void requestReset(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            PasswordResetToken token = issueToken(user);
            emailService.sendPasswordResetEmail(user.getEmail(), resetUrl + "?token=" + token.getToken());
        });
    }

    /**
     * Consumes a token to set a new password. Throws if the token is unknown,
     * expired, or already used.
     */
    public void resetPassword(String rawToken, String newPassword) {
        PasswordResetToken token = tokenRepository.findByToken(rawToken)
                .orElseThrow(() -> new ResourceNotFoundException("Reset link is invalid"));

        if (token.getUsedAt() != null) {
            throw new IllegalArgumentException("Reset link has already been used");
        }
        if (token.getExpiresAt().isBefore(Instant.now())) {
            throw new IllegalArgumentException("Reset link has expired — request a new one");
        }

        User user = token.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        token.setUsedAt(Instant.now());
        tokenRepository.save(token);
        log.info("Password reset completed for user: {}", user.getUsername());
    }

    private PasswordResetToken issueToken(User user) {
        byte[] bytes = new byte[TOKEN_BYTES];
        new SecureRandom().nextBytes(bytes);
        String value = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);

        PasswordResetToken token = new PasswordResetToken();
        token.setToken(value);
        token.setUser(user);
        token.setExpiresAt(Instant.now().plus(TTL_MINUTES, ChronoUnit.MINUTES));
        return tokenRepository.save(token);
    }
}
