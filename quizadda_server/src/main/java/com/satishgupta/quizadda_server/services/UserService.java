package com.satishgupta.quizadda_server.services;

import com.satishgupta.quizadda_server.models.User;
import com.satishgupta.quizadda_server.models.UserRole;

import java.util.Set;

public interface UserService {

    // creating user
    public User createUser(User user, Set<UserRole> userRoles) throws Exception;


}
