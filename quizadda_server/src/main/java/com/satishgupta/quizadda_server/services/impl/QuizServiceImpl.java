package com.satishgupta.quizadda_server.services.impl;

import com.satishgupta.quizadda_server.dto.PageResponse;
import com.satishgupta.quizadda_server.dto.quiz.EvaluateQuizRequest;
import com.satishgupta.quizadda_server.dto.quiz.EvaluateQuizResponse;
import com.satishgupta.quizadda_server.dto.quiz.LeaderboardEntry;
import com.satishgupta.quizadda_server.dto.quiz.QuizAttemptResponse;
import com.satishgupta.quizadda_server.dto.quiz.QuizRequest;
import com.satishgupta.quizadda_server.dto.quiz.QuizResponse;
import com.satishgupta.quizadda_server.exceptions.ResourceNotFoundException;
import com.satishgupta.quizadda_server.mappers.QuizAttemptMapper;
import com.satishgupta.quizadda_server.mappers.QuizMapper;
import com.satishgupta.quizadda_server.models.QuizAttempt;
import com.satishgupta.quizadda_server.models.User;
import com.satishgupta.quizadda_server.models.quizPortal.Category;
import com.satishgupta.quizadda_server.models.quizPortal.Difficulty;
import com.satishgupta.quizadda_server.models.quizPortal.Question;
import com.satishgupta.quizadda_server.models.quizPortal.Quiz;
import com.satishgupta.quizadda_server.repositories.CategoryRepository;
import com.satishgupta.quizadda_server.repositories.QuestionRepository;
import com.satishgupta.quizadda_server.repositories.QuizAttemptRepository;
import com.satishgupta.quizadda_server.repositories.QuizRepository;
import com.satishgupta.quizadda_server.services.QuizService;
import com.satishgupta.quizadda_server.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class QuizServiceImpl implements QuizService {

    private final QuizRepository quizRepository;
    private final CategoryRepository categoryRepository;
    private final QuestionRepository questionRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final UserService userService;

    @Override
    public QuizResponse addQuiz(QuizRequest request) {
        Quiz quiz = new Quiz();
        applyRequest(quiz, request);
        return QuizMapper.toResponse(quizRepository.save(quiz));
    }

    @Override
    public QuizResponse updateQuiz(Long quizId, QuizRequest request) {
        Quiz existing = getQuizEntity(quizId);
        applyRequest(existing, request);
        return QuizMapper.toResponse(quizRepository.save(existing));
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuizResponse> getQuizzes() {
        return quizRepository.findAll().stream().map(QuizMapper::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public QuizResponse getQuiz(Long quizId) {
        return QuizMapper.toResponse(getQuizEntity(quizId));
    }

    @Override
    @Transactional(readOnly = true)
    public Quiz getQuizEntity(Long quizId) {
        return quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz", "id", quizId));
    }

    @Override
    public void deleteQuiz(Long quizId) {
        if (!quizRepository.existsById(quizId)) {
            throw new ResourceNotFoundException("Quiz", "id", quizId);
        }
        quizRepository.deleteById(quizId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuizResponse> getQuizzesOfCategory(Long categoryId) {
        Category category = requireCategory(categoryId);
        return quizRepository.findByCategory(category).stream().map(QuizMapper::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuizResponse> getActiveQuizzes() {
        return quizRepository.findByActive(true).stream().map(QuizMapper::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuizResponse> getActiveQuizzesOfCategory(Long categoryId) {
        Category category = requireCategory(categoryId);
        return quizRepository.findByCategoryAndActive(category, true).stream()
                .map(QuizMapper::toResponse).toList();
    }

    @Override
    public EvaluateQuizResponse evaluateQuiz(Long quizId, EvaluateQuizRequest request) {
        Quiz quiz = getQuizEntity(quizId);

        // Server-side lookup of correct answers; never trust answers from the client.
        Map<Long, Question> questionsById = new HashMap<>();
        for (Question q : questionRepository.findByQuiz(quiz)) {
            questionsById.put(q.getQuesId(), q);
        }

        double totalMaxMarks = Double.parseDouble(quiz.getMaxMarks());
        int totalQuestions = questionsById.size();
        double marksPerQuestion = totalQuestions == 0 ? 0d : totalMaxMarks / totalQuestions;

        double marksGot = 0d;
        int correct = 0;
        int attempted = 0;

        for (EvaluateQuizRequest.Answer ans : request.answers()) {
            Question q = questionsById.get(ans.quesId());
            if (q == null) continue;

            String chosen = ans.chosenAnswer();
            boolean answered = chosen != null && !chosen.trim().isEmpty();
            if (answered) attempted++;

            if (answered && chosen.trim().equals(q.getAnswer().trim())) {
                correct++;
                marksGot += marksPerQuestion;
            }
        }

        // Persist the attempt so it shows up in history, leaderboards, and analytics.
        persistAttempt(quiz, marksGot, correct, attempted, totalQuestions);

        return new EvaluateQuizResponse(marksGot, correct, attempted, totalQuestions);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<QuizAttemptResponse> getMyAttempts(Pageable pageable) {
        User user = currentUser();
        return PageResponse.from(
                quizAttemptRepository.findByUserOrderByAttemptedAtDesc(user, pageable)
                        .map(QuizAttemptMapper::toResponse)
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<LeaderboardEntry> getLeaderboard(Long quizId) {
        Quiz quiz = getQuizEntity(quizId);
        List<QuizAttempt> top = quizAttemptRepository.findTop10ByQuizOrderByMarksGotDescAttemptedAtAsc(quiz);
        List<LeaderboardEntry> entries = new ArrayList<>(top.size());
        for (int i = 0; i < top.size(); i++) {
            entries.add(QuizAttemptMapper.toLeaderboardEntry(top.get(i), i + 1));
        }
        return entries;
    }

    private void persistAttempt(Quiz quiz, double marksGot, int correct, int attempted, int total) {
        QuizAttempt attempt = new QuizAttempt();
        attempt.setUser(currentUser());
        attempt.setQuiz(quiz);
        attempt.setMarksGot(marksGot);
        attempt.setCorrectAnswers(correct);
        attempt.setAttempted(attempted);
        attempt.setTotalQuestions(total);
        attempt.setAttemptedAt(Instant.now());
        quizAttemptRepository.save(attempt);
    }

    /**
     * Resolves the authenticated user from the SecurityContext. Throws if the
     * caller is somehow anonymous (shouldn't be possible — evaluation endpoints
     * require auth — but defensive in case the controller security is later loosened).
     */
    private User currentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof User u) {
            return u;
        }
        // The principal is a UserDetails — re-resolve to a managed entity.
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userService.getUserEntityByUsername(username);
    }

    private void applyRequest(Quiz quiz, QuizRequest request) {
        quiz.setTitle(request.title());
        quiz.setDescription(request.description());
        quiz.setMaxMarks(request.maxMarks());
        quiz.setNumberOfQuestions(request.numberOfQuestions());
        quiz.setActive(request.active());
        quiz.setDifficulty(request.difficulty() != null ? request.difficulty() : Difficulty.MEDIUM);
        quiz.setTags(normalizeTags(request.tags()));
        quiz.setCategory(requireCategory(request.categoryId()));
    }

    /**
     * Lowercase, trim, drop blanks, deduplicate. Keeps tags consistent across
     * quizzes so {@code WHERE tag = 'javascript'} matches "JavaScript " too.
     */
    private Set<String> normalizeTags(Set<String> raw) {
        if (raw == null || raw.isEmpty()) return new LinkedHashSet<>();
        return raw.stream()
                .filter(t -> t != null && !t.isBlank())
                .map(t -> t.trim().toLowerCase(Locale.ROOT))
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    private Category requireCategory(Long categoryId) {
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", categoryId));
    }
}
