package com.satishgupta.quizadda_server.controllers;

import com.satishgupta.quizadda_server.models.quizPortal.Quiz;
import com.satishgupta.quizadda_server.services.QuizService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/quiz")
@CrossOrigin("*")
public class QuizController {

    @Autowired
    private QuizService quizService;

    @PostMapping("/")
    public ResponseEntity<Quiz> addQuiz(@RequestBody Quiz quiz) {
        Quiz quiz1 = this.quizService.addQuiz(quiz);
        return ResponseEntity.ok(quiz1);
    }

    // get all quizzes
    @GetMapping("/")
    public ResponseEntity<List<Quiz>> getAllQuizzes() {
        return ResponseEntity.ok(this.quizService.getQuizzes());
    }

    // get quiz by id
    @GetMapping("/{quizId}")
    public ResponseEntity<Quiz> getQuiz(@PathVariable("quizId") Long quizId) {
        return ResponseEntity.ok(this.quizService.getQuiz(quizId));
    }

    // update quiz
    @PutMapping("/")
    public ResponseEntity<Quiz> updateQuiz(@RequestBody Quiz quiz) {
        return ResponseEntity.ok(this.quizService.updateQuiz(quiz));
    }

    // delete quiz
    @DeleteMapping("/{quizId}")
    public void deleteQuiz(@PathVariable("quizId") Long quizId) {
        this.quizService.deleteQuiz(quizId);
    }
}
