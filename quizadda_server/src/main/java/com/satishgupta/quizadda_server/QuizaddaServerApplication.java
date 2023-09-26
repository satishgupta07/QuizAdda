package com.satishgupta.quizadda_server;

import com.satishgupta.quizadda_server.models.Role;
import com.satishgupta.quizadda_server.models.User;
import com.satishgupta.quizadda_server.models.UserRole;
import com.satishgupta.quizadda_server.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.util.HashSet;
import java.util.Set;

@SpringBootApplication
public class QuizaddaServerApplication implements CommandLineRunner {

	@Autowired
	private UserService userService;

	public static void main(String[] args) {
		SpringApplication.run(QuizaddaServerApplication.class, args);
	}

	@Override
	public void run(String... args) throws Exception {
		System.out.println("starting code");

		User user = new User();

		user.setFirstName("Satish");
		user.setLastName("Gupta");
		user.setUsername("satish07");
		user.setPassword("12345678");
		user.setEmail("satishgupta07@gmail.com");
		user.setProfile("default.png");

		Role role1 = new Role();
		role1.setRoleId(44L);
		role1.setRoleName("ADMIN");

		Set<UserRole> userRoleSet = new HashSet<>();
		UserRole userRole = new UserRole();
		userRole.setRole(role1);
		userRole.setUser(user);

		userRoleSet.add(userRole);

		User user1 = this.userService.createUser(user, userRoleSet);
		System.out.println(user1.getUsername());
	}
}
