package com.satishgupta.quizadda_server.services;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * Email sender stub. Production: replace with a real implementation (Spring
 * Mail + SMTP, SendGrid, SES, etc.) and inject by interface. For now we log
 * the message so the dev/portfolio flow is observable from the server console.
 */
@Slf4j
@Service
public class EmailService {

    public void sendPasswordResetEmail(String to, String resetLink) {
        log.info("""

                ===== EMAIL (stub) =====
                To: {}
                Subject: Reset your QuizAdda password

                You requested a password reset. Open the link below to choose a new password:
                {}

                The link expires in 30 minutes. If you didn't request this, ignore this email.
                ========================
                """, to, resetLink);
    }

    public void sendEmailVerification(String to, String verifyLink) {
        log.info("""

                ===== EMAIL (stub) =====
                To: {}
                Subject: Verify your QuizAdda email

                Welcome to QuizAdda! Click the link below to verify your email:
                {}

                The link expires in 24 hours.
                ========================
                """, to, verifyLink);
    }
}
