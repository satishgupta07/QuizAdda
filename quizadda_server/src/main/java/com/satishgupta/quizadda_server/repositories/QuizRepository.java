package com.satishgupta.quizadda_server.repositories;

import com.satishgupta.quizadda_server.models.quizPortal.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuizRepository extends JpaRepository<Quiz, Long> {
}
