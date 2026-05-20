package com.satishgupta.quizadda_server.services;

import com.satishgupta.quizadda_server.dto.user.RegisterUserRequest;
import com.satishgupta.quizadda_server.dto.user.UserResponse;
import com.satishgupta.quizadda_server.models.User;

/**
 * Business operations on users. Registration enforces username + email uniqueness
 * and always assigns the {@code USER} role; promotion to {@code ADMIN} is an
 * out-of-band operation.
 */
public interface UserService {

    UserResponse registerUser(RegisterUserRequest request);

    UserResponse getUserByUsername(String username);

    /** Internal accessor that returns the JPA entity (needed by Spring Security). */
    User getUserEntityByUsername(String username);

    void deleteUserById(Long userId);
}
