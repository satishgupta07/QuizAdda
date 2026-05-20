package com.satishgupta.quizadda_server.services.impl;

import com.satishgupta.quizadda_server.config.DataLoader;
import com.satishgupta.quizadda_server.dto.user.ChangePasswordRequest;
import com.satishgupta.quizadda_server.dto.user.RegisterUserRequest;
import com.satishgupta.quizadda_server.dto.user.UpdateProfileRequest;
import com.satishgupta.quizadda_server.dto.user.UserResponse;
import com.satishgupta.quizadda_server.exceptions.DuplicateResourceException;
import com.satishgupta.quizadda_server.exceptions.ResourceNotFoundException;
import com.satishgupta.quizadda_server.mappers.UserMapper;
import com.satishgupta.quizadda_server.models.Role;
import com.satishgupta.quizadda_server.models.User;
import com.satishgupta.quizadda_server.models.UserRole;
import com.satishgupta.quizadda_server.repositories.RoleRepository;
import com.satishgupta.quizadda_server.repositories.UserRepository;
import com.satishgupta.quizadda_server.services.EmailVerificationService;
import com.satishgupta.quizadda_server.services.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService {

    private static final String DEFAULT_PROFILE_IMAGE = "default.png";

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailVerificationService emailVerificationService;

    @Override
    public UserResponse registerUser(RegisterUserRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new DuplicateResourceException("Username '%s' is already taken".formatted(request.username()));
        }
        if (userRepository.existsByEmail(request.email())) {
            throw new DuplicateResourceException("Email '%s' is already registered".formatted(request.email()));
        }

        User user = new User();
        user.setUsername(request.username());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());
        user.setEmail(request.email());
        user.setPhone(request.phone());
        user.setProfile(DEFAULT_PROFILE_IMAGE);
        user.setEnabled(true);
        // New registrations start unverified; the welcome email's link
        // flips this to true once the user clicks through.
        user.setEmailVerified(false);

        // Look up the seeded USER role rather than fabricating one inline — keeps
        // role IDs consistent with whatever the database assigned at seed time.
        Role userRole = roleRepository.findByRoleName(DataLoader.ROLE_USER)
                .orElseThrow(() -> new IllegalStateException(
                        "Default USER role missing — was DataLoader executed?"));

        UserRole link = new UserRole();
        link.setUser(user);
        link.setRole(userRole);

        Set<UserRole> roles = new HashSet<>();
        roles.add(link);
        user.setUserRoles(roles);

        User saved = userRepository.save(user);
        emailVerificationService.sendVerification(saved);
        log.info("Registered new user: {}", saved.getUsername());
        return UserMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserByUsername(String username) {
        return UserMapper.toResponse(getUserEntityByUsername(username));
    }

    @Override
    @Transactional(readOnly = true)
    public User getUserEntityByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
    }

    @Override
    public void deleteUserById(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User", "id", userId);
        }
        userRepository.deleteById(userId);
    }

    @Override
    public UserResponse updateProfile(String username, UpdateProfileRequest request) {
        User user = getUserEntityByUsername(username);

        // Allow email change but enforce uniqueness if it changed.
        if (!user.getEmail().equalsIgnoreCase(request.email())
                && userRepository.existsByEmail(request.email())) {
            throw new DuplicateResourceException("Email '%s' is already registered".formatted(request.email()));
        }

        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());
        user.setEmail(request.email());
        user.setPhone(request.phone());
        return UserMapper.toResponse(userRepository.save(user));
    }

    @Override
    public void changePassword(String username, ChangePasswordRequest request) {
        User user = getUserEntityByUsername(username);
        // Reject if the supplied current password doesn't match — Spring Security
        // wraps the failure in BadCredentialsException so the global handler
        // returns 401 with a generic "Invalid username or password" message.
        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw new BadCredentialsException("Current password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
        log.info("Password changed for user: {}", username);
    }
}
