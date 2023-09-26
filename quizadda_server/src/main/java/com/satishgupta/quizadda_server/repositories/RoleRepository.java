package com.satishgupta.quizadda_server.repositories;

import com.satishgupta.quizadda_server.models.Role;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleRepository extends JpaRepository<Role, Long> {
}
