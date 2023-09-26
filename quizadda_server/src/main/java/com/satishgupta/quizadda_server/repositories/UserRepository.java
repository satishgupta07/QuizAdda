package com.satishgupta.quizadda_server.repositories;

import com.satishgupta.quizadda_server.models.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    public User findByUsername(String username);
}
