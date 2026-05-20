package com.satishgupta.quizadda_server.controllers;

import com.satishgupta.quizadda_server.config.JwtUtils;
import com.satishgupta.quizadda_server.dto.auth.ForgotPasswordRequest;
import com.satishgupta.quizadda_server.dto.auth.LoginRequest;
import com.satishgupta.quizadda_server.dto.auth.LoginResponse;
import com.satishgupta.quizadda_server.dto.auth.ResetPasswordRequest;
import com.satishgupta.quizadda_server.dto.user.ChangePasswordRequest;
import com.satishgupta.quizadda_server.dto.user.UpdateProfileRequest;
import com.satishgupta.quizadda_server.dto.user.UserResponse;
import com.satishgupta.quizadda_server.mappers.UserMapper;
import com.satishgupta.quizadda_server.services.EmailVerificationService;
import com.satishgupta.quizadda_server.services.PasswordResetService;
import com.satishgupta.quizadda_server.services.UserService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

/**
 * Authentication endpoints. Issues JWTs on successful login and exposes the
 * profile of the currently authenticated user. Stateless — no server-side
 * session is created.
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Auth", description = "Authentication endpoints")
public class AuthController {

    private final UserDetailsService userDetailsService;
    private final UserService userService;
    private final PasswordResetService passwordResetService;
    private final EmailVerificationService emailVerificationService;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        // Spring Security throws BadCredentialsException on failure; the global
        // handler translates that to a 401 with a generic message.
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.password()));

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.username());
        String token = jwtUtils.generateToken(userDetails);
        UserResponse user = userService.getUserByUsername(request.username());

        return ResponseEntity.ok(new LoginResponse(token, user));
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> currentUser(Principal principal) {
        return ResponseEntity.ok(UserMapper.toResponse(
                userService.getUserEntityByUsername(principal.getName())));
    }

    /** Updates the caller's editable profile fields (name, email, phone). */
    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateMe(Principal principal,
                                                 @Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(userService.updateProfile(principal.getName(), request));
    }

    /** Changes the caller's password; requires the current password to be supplied. */
    @PostMapping("/me/password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void changePassword(Principal principal,
                               @Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(principal.getName(), request);
    }

    /**
     * Triggers the password reset flow. Always returns 204 even if the email
     * isn't registered — prevents account enumeration.
     */
    @PostMapping("/forgot-password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        passwordResetService.requestReset(request.email());
    }

    /** Consumes the reset token to set a new password. */
    @PostMapping("/reset-password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        passwordResetService.resetPassword(request.token(), request.newPassword());
    }

    /**
     * Consumes the email-verification token. Uses POST (with token in the body)
     * rather than GET to avoid accidental verification by link prefetchers.
     */
    @PostMapping("/verify-email")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void verifyEmail(@RequestBody com.satishgupta.quizadda_server.dto.auth.VerifyEmailRequest request) {
        emailVerificationService.verify(request.token());
    }
}
