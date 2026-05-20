package com.satishgupta.quizadda_server.controllers;

import com.satishgupta.quizadda_server.dto.PageResponse;
import com.satishgupta.quizadda_server.dto.quiz.EvaluateQuizRequest;
import com.satishgupta.quizadda_server.dto.quiz.EvaluateQuizResponse;
import com.satishgupta.quizadda_server.dto.quiz.LeaderboardEntry;
import com.satishgupta.quizadda_server.dto.quiz.QuizAttemptResponse;
import com.satishgupta.quizadda_server.dto.quiz.QuizRequest;
import com.satishgupta.quizadda_server.dto.quiz.QuizResponse;
import com.satishgupta.quizadda_server.services.QuizService;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

/**
 * Quiz CRUD plus the user-facing evaluation endpoint. Evaluation logic itself
 * lives in {@link com.satishgupta.quizadda_server.services.QuizService} because
 * scoring must use the server's authoritative answer key — clients can't be
 * trusted to score themselves.
 */
@RestController
@RequestMapping("/api/v1/quizzes")
@RequiredArgsConstructor
@Tag(name = "Quizzes", description = "Quiz management and evaluation")
public class QuizController {

    private final QuizService quizService;

    @PostMapping
    public ResponseEntity<QuizResponse> create(@Valid @RequestBody QuizRequest request) {
        QuizResponse created = quizService.addQuiz(request);
        return ResponseEntity
                .created(URI.create("/api/v1/quizzes/" + created.quizId()))
                .body(created);
    }

    @GetMapping
    public ResponseEntity<List<QuizResponse>> list() {
        return ResponseEntity.ok(quizService.getQuizzes());
    }

    @GetMapping("/{quizId}")
    public ResponseEntity<QuizResponse> get(@PathVariable Long quizId) {
        return ResponseEntity.ok(quizService.getQuiz(quizId));
    }

    @PutMapping("/{quizId}")
    public ResponseEntity<QuizResponse> update(@PathVariable Long quizId,
                                               @Valid @RequestBody QuizRequest request) {
        return ResponseEntity.ok(quizService.updateQuiz(quizId, request));
    }

    @DeleteMapping("/{quizId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long quizId) {
        quizService.deleteQuiz(quizId);
    }

    @GetMapping("/active")
    public ResponseEntity<List<QuizResponse>> listActive() {
        return ResponseEntity.ok(quizService.getActiveQuizzes());
    }

    @GetMapping(params = "categoryId")
    public ResponseEntity<List<QuizResponse>> listByCategory(@RequestParam Long categoryId) {
        return ResponseEntity.ok(quizService.getQuizzesOfCategory(categoryId));
    }

    @GetMapping(value = "/active", params = "categoryId")
    public ResponseEntity<List<QuizResponse>> listActiveByCategory(@RequestParam Long categoryId) {
        return ResponseEntity.ok(quizService.getActiveQuizzesOfCategory(categoryId));
    }

    @PostMapping("/{quizId}/evaluate")
    public ResponseEntity<EvaluateQuizResponse> evaluate(@PathVariable Long quizId,
                                                         @Valid @RequestBody EvaluateQuizRequest request) {
        return ResponseEntity.ok(quizService.evaluateQuiz(quizId, request));
    }

    /**
     * Paginated attempt history for the caller (newest first).
     * Defaults to 20 per page if {@code page} / {@code size} aren't provided.
     */
    @GetMapping("/my-attempts")
    public ResponseEntity<PageResponse<QuizAttemptResponse>> myAttempts(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(quizService.getMyAttempts(pageable));
    }

    /** Public leaderboard for a quiz — top 10 attempts by score. */
    @GetMapping("/{quizId}/leaderboard")
    public ResponseEntity<List<LeaderboardEntry>> leaderboard(@PathVariable Long quizId) {
        return ResponseEntity.ok(quizService.getLeaderboard(quizId));
    }
}
