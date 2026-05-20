package com.satishgupta.quizadda_server.services;

import com.satishgupta.quizadda_server.exceptions.ResourceNotFoundException;
import com.satishgupta.quizadda_server.models.EmailVerificationToken;
import com.satishgupta.quizadda_server.models.User;
import com.satishgupta.quizadda_server.repositories.EmailVerificationTokenRepository;
import com.satishgupta.quizadda_server.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;

/**
 * Issues + consumes email-verification tokens. Called from
 * {@code UserServiceImpl.registerUser} immediately after creating an account.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class EmailVerificationService {

    private static final int TOKEN_BYTES = 32;
    private static final long TTL_HOURS = 24;

    private final UserRepository userRepository;
    private final EmailVerificationTokenRepository tokenRepository;
    private final EmailService emailService;

    @Value("${app.frontend.email-verify-url:http://localhost:4200/verify-email}")
    private String verifyUrl;

    /** Generates a token, persists it, and emails the verification link. */
    public void sendVerification(User user) {
        EmailVerificationToken token = issueToken(user);
        emailService.sendEmailVerification(user.getEmail(), verifyUrl + "?token=" + token.getToken());
    }

    /** Consumes the token, marking the associated user's email as verified. */
    public void verify(String rawToken) {
        EmailVerificationToken token = tokenRepository.findByToken(rawToken)
                .orElseThrow(() -> new ResourceNotFoundException("Verification link is invalid"));

        if (token.getUsedAt() != null) {
            throw new IllegalArgumentException("Verification link has already been used");
        }
        if (token.getExpiresAt().isBefore(Instant.now())) {
            throw new IllegalArgumentException("Verification link has expired");
        }

        User user = token.getUser();
        user.setEmailVerified(true);
        userRepository.save(user);

        token.setUsedAt(Instant.now());
        tokenRepository.save(token);
        log.info("Email verified for user: {}", user.getUsername());
    }

    private EmailVerificationToken issueToken(User user) {
        byte[] bytes = new byte[TOKEN_BYTES];
        new SecureRandom().nextBytes(bytes);
        EmailVerificationToken token = new EmailVerificationToken();
        token.setToken(Base64.getUrlEncoder().withoutPadding().encodeToString(bytes));
        token.setUser(user);
        token.setExpiresAt(Instant.now().plus(TTL_HOURS, ChronoUnit.HOURS));
        return tokenRepository.save(token);
    }
}
