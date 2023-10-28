package com.satishgupta.quizadda_server.controllers;

import com.satishgupta.quizadda_server.models.quizPortal.Question;
import com.satishgupta.quizadda_server.models.quizPortal.Quiz;
import com.satishgupta.quizadda_server.services.QuestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/question")
@CrossOrigin("*")
public class QuestionController {

    @Autowired
    private QuestionService questionService;

    @PostMapping("/")
    public ResponseEntity<Question> addQuestion(@RequestBody Question question) {
        Question question1 = this.questionService.addQuestion(question);
        return ResponseEntity.ok(question1);
    }

    // get all questions
    @GetMapping("/")
    public ResponseEntity<List<Question>> getAllQuestions() {
        return ResponseEntity.ok(this.questionService.getQuestions());
    }

    // get all questions of any quiz
    @GetMapping("/quiz/{quizId}")
    public ResponseEntity<List<Question>> getQuestionsOfQuiz(@PathVariable("quizId") Long quizId) {
        Quiz quiz = new Quiz();
        quiz.setQuizId(quizId);
        return ResponseEntity.ok(this.questionService.getQuestionsOfQuiz(quiz));
    }

    // get question by id
    @GetMapping("/{questionId}")
    public ResponseEntity<Question> getQuestion(@PathVariable("questionId") Long questionId) {
        return ResponseEntity.ok(this.questionService.getQuestion(questionId));
    }

    // update question
    @PutMapping("/")
    public ResponseEntity<Question> updateQuestion(@RequestBody Question question) {
        return ResponseEntity.ok(this.questionService.updateQuestion(question));
    }

    @DeleteMapping("/{questionId}")
    public void deleteQuestion(@PathVariable("questionId") Long questionId) {
        this.questionService.deleteQuestion(questionId);
    }
}
