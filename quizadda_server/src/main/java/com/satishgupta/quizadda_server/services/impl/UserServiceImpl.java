package com.satishgupta.quizadda_server.services.impl;

import com.satishgupta.quizadda_server.models.User;
import com.satishgupta.quizadda_server.models.UserRole;
import com.satishgupta.quizadda_server.repositories.RoleRepository;
import com.satishgupta.quizadda_server.repositories.UserRepository;
import com.satishgupta.quizadda_server.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    // creating user
    @Override
    public User createUser(User user, Set<UserRole> userRoles) throws Exception {
        User local = this.userRepository.findByUsername(user.getUsername());
        if(local != null) {
            System.out.println("User is already there !!");
            throw new Exception("User already present !!");
        } else {
            //create User
            for(UserRole ur:userRoles) {
                roleRepository.save(ur.getRole());
            }

            user.getUserRoles().addAll(userRoles);
            local = this.userRepository.save(user);
        }
        return local;
    }
}
