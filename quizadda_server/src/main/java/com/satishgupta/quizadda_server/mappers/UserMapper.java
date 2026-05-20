package com.satishgupta.quizadda_server.mappers;

import com.satishgupta.quizadda_server.dto.user.UserResponse;
import com.satishgupta.quizadda_server.models.User;
import com.satishgupta.quizadda_server.models.UserRole;

import java.util.Set;
import java.util.stream.Collectors;

public final class UserMapper {

    private UserMapper() { }

    public static UserResponse toResponse(User u) {
        Set<String> authorities = u.getUserRoles() == null
                ? Set.of()
                : u.getUserRoles().stream()
                        .map(UserRole::getRole)
                        .map(r -> r.getRoleName())
                        .collect(Collectors.toUnmodifiableSet());

        return new UserResponse(
                u.getId(),
                u.getUsername(),
                u.getFirstName(),
                u.getLastName(),
                u.getEmail(),
                u.getPhone(),
                u.getProfile(),
                u.isEnabled(),
                u.isEmailVerified(),
                authorities
        );
    }
}
