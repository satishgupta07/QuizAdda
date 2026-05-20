package com.satishgupta.quizadda_server.config;

import com.satishgupta.quizadda_server.models.Role;
import com.satishgupta.quizadda_server.models.User;
import com.satishgupta.quizadda_server.models.UserRole;
import com.satishgupta.quizadda_server.repositories.RoleRepository;
import com.satishgupta.quizadda_server.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;

/**
 * Seeds the {@code roles} table on startup and creates the default
 * {@code admin / admin} account if it doesn't exist yet. Idempotent —
 * each step is a no-op when the row already matches.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataLoader implements CommandLineRunner {

    public static final String ROLE_USER  = "USER";
    public static final String ROLE_ADMIN = "ADMIN";

    /** Default admin credentials — change the password via the profile UI after first login. */
    private static final String DEFAULT_ADMIN_USERNAME = "admin";
    private static final String DEFAULT_ADMIN_PASSWORD = "admin";

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        ensureRole(ROLE_USER);
        Role adminRole = ensureRole(ROLE_ADMIN);
        ensureDefaultAdmin(adminRole);
    }

    private void ensureDefaultAdmin(Role adminRole) {
        if (userRepository.existsByUsername(DEFAULT_ADMIN_USERNAME)) {
            log.info("Default admin user '{}' already exists; skipping creation.",
                    DEFAULT_ADMIN_USERNAME);
            return;
        }

        User user = new User();
        user.setUsername(DEFAULT_ADMIN_USERNAME);
        user.setPassword(passwordEncoder.encode(DEFAULT_ADMIN_PASSWORD));
        user.setFirstName("Admin");
        user.setLastName("User");
        user.setEmail("admin@quizadda.app");
        user.setPhone("");
        user.setProfile("default.png");
        user.setEnabled(true);
        // Bootstrap admin is trusted; no need to bounce through the email link.
        user.setEmailVerified(true);

        UserRole link = new UserRole();
        link.setUser(user);
        link.setRole(adminRole);

        Set<UserRole> roles = new HashSet<>();
        roles.add(link);
        user.setUserRoles(roles);

        userRepository.save(user);
        log.info("Created default admin user '{}'.", DEFAULT_ADMIN_USERNAME);
    }

    private Role ensureRole(String name) {
        return roleRepository.findByRoleName(name).orElseGet(() -> {
            Role role = new Role();
            role.setRoleName(name);
            log.info("Seeding role: {}", name);
            return roleRepository.save(role);
        });
    }
}
