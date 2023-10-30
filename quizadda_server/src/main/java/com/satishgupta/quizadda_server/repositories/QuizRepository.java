package com.satishgupta.quizadda_server.repositories;

import com.satishgupta.quizadda_server.models.quizPortal.Category;
import com.satishgupta.quizadda_server.models.quizPortal.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuizRepository extends JpaRepository<Quiz, Long> {
    public List<Quiz> findByCategory(Category category);

    public List<Quiz> findByActive(Boolean active);

    public List<Quiz> findByCategoryAndActive(Category category, Boolean active);
}
