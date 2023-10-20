package com.satishgupta.quizadda_server.repositories;

import com.satishgupta.quizadda_server.models.quizPortal.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {
}
