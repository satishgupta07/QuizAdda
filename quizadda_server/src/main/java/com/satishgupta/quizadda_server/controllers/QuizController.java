package com.satishgupta.quizadda_server.controllers;

import com.satishgupta.quizadda_server.models.quizPortal.Category;
import com.satishgupta.quizadda_server.models.quizPortal.Question;
import com.satishgupta.quizadda_server.models.quizPortal.Quiz;
import com.satishgupta.quizadda_server.services.QuestionService;
import com.satishgupta.quizadda_server.services.QuizService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/quiz")
@CrossOrigin("*")
public class QuizController {

    @Autowired
    private QuizService quizService;

    @Autowired
    private QuestionService questionService;

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

    // get quiz by category
    @GetMapping("/category/{catId}")
    public ResponseEntity<List<Quiz>> getQuizByCategory(@PathVariable("catId") Long catId) {
        Category category = new Category();
        category.setCatId(catId);
        return ResponseEntity.ok(this.quizService.getQuizzesOfCategory(category));
    }

    // get active quizzes
    @GetMapping("/active")
    public ResponseEntity<List<Quiz>> getActiveQuizzes() {
        return ResponseEntity.ok(this.quizService.getActiveQuizzes(true));
    }

    @GetMapping("/active/category/{catId}")
    public ResponseEntity<List<Quiz>> getActiveQuizByCategory(@PathVariable("catId") Long catId) {
        Category category = new Category();
        category.setCatId(catId);
        return ResponseEntity.ok(this.quizService.getActiveQuizzesOfCategory(category, true));
    }

    @PostMapping("/eval-quiz")
    public ResponseEntity<?> evaluateQuiz(@RequestBody List<Question> questions) {
        float marksGot = 0f;
        int correctAnswers = 0;
        int attempted = 0;
        for(Question ques: questions) {
            Question question = this.questionService.get(ques.getQuesId());
            if(ques.getChosenAnswer().trim().equals(question.getAnswer().trim())) {
                correctAnswers++;
                float oneQuesMarks = Float.parseFloat(questions.get(0).getQuiz().getMaxMarks())/questions.size();
                marksGot += oneQuesMarks;
            }
            System.out.println(ques.getChosenAnswer() != null);
            System.out.println(ques.getChosenAnswer() != "");
            if(ques.getChosenAnswer() != null && !ques.getChosenAnswer().trim().equals("")) {
                attempted++;
            }
        }

        Map<String, Object> map = Map.of("marksGot", marksGot, "correctAnswers", correctAnswers, "attempted", attempted);

        return ResponseEntity.ok(map);
    }
}
