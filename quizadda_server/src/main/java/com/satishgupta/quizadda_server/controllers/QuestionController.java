package com.satishgupta.quizadda_server.controllers;

import com.satishgupta.quizadda_server.dto.question.BulkImportResult;
import com.satishgupta.quizadda_server.dto.question.QuestionRequest;
import com.satishgupta.quizadda_server.dto.question.QuestionResponse;
import com.satishgupta.quizadda_server.services.QuestionImportService;
import com.satishgupta.quizadda_server.services.QuestionService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

import java.net.URI;
import java.util.List;

/**
 * Question CRUD plus two distinct list views:
 * <ul>
 *   <li>{@code GET ?quizId=...} — admin/full view, includes the correct answer</li>
 *   <li>{@code GET /take?quizId=...} — user view, returns a random subset with
 *       the answer field stripped to prevent client-side cheating</li>
 * </ul>
 */
@RestController
@RequestMapping("/api/v1/questions")
@RequiredArgsConstructor
@Tag(name = "Questions", description = "Question management")
public class QuestionController {

    private final QuestionService questionService;
    private final QuestionImportService questionImportService;

    @PostMapping
    public ResponseEntity<QuestionResponse> create(@Valid @RequestBody QuestionRequest request) {
        QuestionResponse created = questionService.addQuestion(request);
        return ResponseEntity
                .created(URI.create("/api/v1/questions/" + created.quesId()))
                .body(created);
    }

    @GetMapping
    public ResponseEntity<List<QuestionResponse>> list() {
        return ResponseEntity.ok(questionService.getQuestions());
    }

    @GetMapping("/{questionId}")
    public ResponseEntity<QuestionResponse> get(@PathVariable Long questionId) {
        return ResponseEntity.ok(questionService.getQuestion(questionId));
    }

    @PutMapping("/{questionId}")
    public ResponseEntity<QuestionResponse> update(@PathVariable Long questionId,
                                                   @Valid @RequestBody QuestionRequest request) {
        return ResponseEntity.ok(questionService.updateQuestion(questionId, request));
    }

    @DeleteMapping("/{questionId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long questionId) {
        questionService.deleteQuestion(questionId);
    }

    /** Admin view: all questions for a quiz including the correct answer. */
    @GetMapping(params = "quizId")
    public ResponseEntity<List<QuestionResponse>> listByQuiz(@RequestParam Long quizId) {
        return ResponseEntity.ok(questionService.getQuestionsOfQuiz(quizId));
    }

    /** User view: random subset for taking the quiz; the {@code answer} field is omitted. */
    @GetMapping("/take")
    public ResponseEntity<List<QuestionResponse>> takeQuiz(@RequestParam Long quizId) {
        return ResponseEntity.ok(questionService.getRandomQuestionsForUser(quizId));
    }

    /**
     * Admin-only bulk import. CSV header:
     * {@code content,option1,option2,option3,option4,answer[,image]}.
     */
    @PostMapping("/import")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<BulkImportResult> importCsv(@RequestParam Long quizId,
                                                      @RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(questionImportService.importCsv(quizId, file));
    }
}
