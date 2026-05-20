package com.satishgupta.quizadda_server.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/**
 * Single-use token issued on registration to confirm an email address.
 * Expires after 24 hours.
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "email_verification_tokens",
        indexes = @Index(name = "idx_email_verify_token", columnList = "token", unique = true))
public class EmailVerificationToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 64, unique = true)
    private String token;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "used_at")
    private Instant usedAt;
}
