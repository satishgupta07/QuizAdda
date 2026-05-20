package com.satishgupta.quizadda_server.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/**
 * Single-use token issued when a user requests a password reset. Tokens expire
 * after 30 minutes (see {@link #expiresAt}) and are marked used after a
 * successful reset.
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "password_reset_tokens",
        indexes = @Index(name = "idx_pwd_reset_token", columnList = "token", unique = true))
public class PasswordResetToken {

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
