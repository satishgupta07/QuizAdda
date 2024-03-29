package com.satishgupta.quizadda_server.controllers;

import com.satishgupta.quizadda_server.models.JwtRequest;
import com.satishgupta.quizadda_server.models.JwtResponse;
import com.satishgupta.quizadda_server.config.JwtUtils;
import com.satishgupta.quizadda_server.models.User;
import com.satishgupta.quizadda_server.services.impl.UserDetailsServiceImpl;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@CrossOrigin("*")
@Tag(name="AuthController", description = "APIs for Authentication")
public class AuthController {

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    @Autowired
    private AuthenticationManager manager;

    @Autowired
    private JwtUtils helper;

    @PostMapping("/generate-token")
    public ResponseEntity<JwtResponse> login(@RequestBody JwtRequest request) {

        this.doAuthenticate(request.getUsername(), request.getPassword());

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());
        String token = this.helper.generateToken(userDetails);

        JwtResponse response = JwtResponse.builder()
                .token(token).build();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    private void doAuthenticate(String username, String password) {
        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(username, password);
        try {
            manager.authenticate(authentication);
        } catch (BadCredentialsException e) {
            throw new BadCredentialsException(" Invalid Username or Password  !!");
        }
    }

    // return the details of current user
    @GetMapping("/current-user")
    public User getCurrentUser(Principal principal) {
        return (User)(this.userDetailsService.loadUserByUsername(principal.getName()));
    }
}
