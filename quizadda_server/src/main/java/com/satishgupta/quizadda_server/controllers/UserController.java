package com.satishgupta.quizadda_server.controllers;

import com.satishgupta.quizadda_server.models.Role;
import com.satishgupta.quizadda_server.models.User;
import com.satishgupta.quizadda_server.models.UserRole;
import com.satishgupta.quizadda_server.services.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.Set;

@RestController
@RequestMapping("/user")
@CrossOrigin("*")
@Tag(name="UserController", description = "APIs for user management")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private BCryptPasswordEncoder bCryptPasswordEncoder;

    @PostMapping("/")
    @Operation(summary = "Create new user !!", description = "this api is for user creation")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Success | OK"),
            @ApiResponse(responseCode = "401", description = "Unauthorised User"),
            @ApiResponse(responseCode = "201", description = "User created successfully !!")
    })
    public User createUser(@RequestBody User user) throws Exception {
        user.setProfile("default.png");

        // encoding password with bcrypt
        user.setPassword(this.bCryptPasswordEncoder.encode(user.getPassword()));

        Set<UserRole> roles = new HashSet<>();

        Role role = new Role();
        role.setRoleId(45L);
        role.setRoleName("USER");

        UserRole userRole = new UserRole();
        userRole.setUser(user);
        userRole.setRole(role);

        roles.add(userRole);
        return this.userService.createUser(user, roles);
    }

    @GetMapping("/{username}")
    public User getUserByUserName(@PathVariable("username") String username) {
        return this.userService.getUserByUsername(username);
    }

    @DeleteMapping("/{userId}")
    public void deleteUserById(@PathVariable("userId") Long userId) {
        this.userService.deleteUserById(userId);
    }
}
