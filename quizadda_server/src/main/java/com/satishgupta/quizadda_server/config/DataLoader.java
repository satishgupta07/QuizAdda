package com.satishgupta.quizadda_server.config;

import com.satishgupta.quizadda_server.models.Role;
import com.satishgupta.quizadda_server.repositories.RoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * Seeds the {@code roles} table with the application's known role names on startup.
 * Idempotent: runs only when a role is missing.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataLoader implements CommandLineRunner {

    public static final String ROLE_USER  = "USER";
    public static final String ROLE_ADMIN = "ADMIN";

    private final RoleRepository roleRepository;

    @Override
    public void run(String... args) {
        ensureRole(ROLE_USER);
        ensureRole(ROLE_ADMIN);
    }

    private void ensureRole(String name) {
        roleRepository.findByRoleName(name).orElseGet(() -> {
            Role role = new Role();
            role.setRoleName(name);
            log.info("Seeding role: {}", name);
            return roleRepository.save(role);
        });
    }
}
