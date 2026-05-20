package com.satishgupta.quizadda_server.config;

import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Round-trip tests for {@link JwtUtils}. Uses a fixed test secret long enough
 * to satisfy HS256's 32-byte minimum.
 */
class JwtUtilsTest {

    private static final String SECRET = "thisIsATestSigningSecretLongEnoughForHs256";

    @Test
    void generatedTokenIsValidForTheSameUser() {
        JwtUtils utils = new JwtUtils(SECRET, 60_000);
        UserDetails user = new User("alice", "x", List.of());

        String token = utils.generateToken(user);

        assertThat(utils.getUsernameFromToken(token)).isEqualTo("alice");
        assertThat(utils.isTokenValid(token, user)).isTrue();
    }

    @Test
    void tokenForOneUserIsRejectedForAnother() {
        JwtUtils utils = new JwtUtils(SECRET, 60_000);
        String token = utils.generateToken(new User("alice", "x", List.of()));

        assertThat(utils.isTokenValid(token, new User("bob", "x", List.of()))).isFalse();
    }

    @Test
    void expiredTokenIsRejected() throws Exception {
        // Expiration of 1ms means the token is dead before the test reaches validation.
        JwtUtils utils = new JwtUtils(SECRET, 1);
        UserDetails user = new User("alice", "x", List.of());
        String token = utils.generateToken(user);
        Thread.sleep(50);

        // JJWT throws on parse of an expired token; treat that as invalid.
        assertThatThrownBy(() -> utils.isTokenValid(token, user))
                .isInstanceOf(io.jsonwebtoken.ExpiredJwtException.class);
    }
}
