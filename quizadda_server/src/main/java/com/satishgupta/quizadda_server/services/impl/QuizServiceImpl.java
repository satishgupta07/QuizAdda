package com.satishgupta.quizadda_server.services.impl;

import com.satishgupta.quizadda_server.dto.quiz.EvaluateQuizRequest;
import com.satishgupta.quizadda_server.dto.quiz.EvaluateQuizResponse;
import com.satishgupta.quizadda_server.dto.quiz.QuizRequest;
import com.satishgupta.quizadda_server.dto.quiz.QuizResponse;
import com.satishgupta.quizadda_server.exceptions.ResourceNotFoundException;
import com.satishgupta.quizadda_server.mappers.QuizMapper;
import com.satishgupta.quizadda_server.models.quizPortal.Category;
import com.satishgupta.quizadda_server.models.quizPortal.Question;
import com.satishgupta.quizadda_server.models.quizPortal.Quiz;
import com.satishgupta.quizadda_server.repositories.CategoryRepository;
import com.satishgupta.quizadda_server.repositories.QuestionRepository;
import com.satishgupta.quizadda_server.repositories.QuizRepository;
import com.satishgupta.quizadda_server.services.QuizService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class QuizServiceImpl implements QuizService {

    private final QuizRepository quizRepository;
    private final CategoryRepository categoryRepository;
    private final QuestionRepository questionRepository;

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
    @Transactional(readOnly = true)
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

        return new EvaluateQuizResponse(marksGot, correct, attempted, totalQuestions);
    }

    private void applyRequest(Quiz quiz, QuizRequest request) {
        quiz.setTitle(request.title());
        quiz.setDescription(request.description());
        quiz.setMaxMarks(request.maxMarks());
        quiz.setNumberOfQuestions(request.numberOfQuestions());
        quiz.setActive(request.active());
        quiz.setCategory(requireCategory(request.categoryId()));
    }

    private Category requireCategory(Long categoryId) {
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", categoryId));
    }
}
