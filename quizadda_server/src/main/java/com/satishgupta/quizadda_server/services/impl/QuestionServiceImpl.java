package com.satishgupta.quizadda_server.services.impl;

import com.satishgupta.quizadda_server.dto.question.QuestionRequest;
import com.satishgupta.quizadda_server.dto.question.QuestionResponse;
import com.satishgupta.quizadda_server.exceptions.ResourceNotFoundException;
import com.satishgupta.quizadda_server.mappers.QuestionMapper;
import com.satishgupta.quizadda_server.models.quizPortal.Question;
import com.satishgupta.quizadda_server.models.quizPortal.Quiz;
import com.satishgupta.quizadda_server.repositories.QuestionRepository;
import com.satishgupta.quizadda_server.services.QuestionService;
import com.satishgupta.quizadda_server.services.QuizService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class QuestionServiceImpl implements QuestionService {

    private final QuestionRepository questionRepository;
    private final QuizService quizService;

    @Override
    public QuestionResponse addQuestion(QuestionRequest request) {
        Question question = new Question();
        applyRequest(question, request);
        return QuestionMapper.toResponse(questionRepository.save(question));
    }

    @Override
    public QuestionResponse updateQuestion(Long questionId, QuestionRequest request) {
        Question existing = findQuestionOrThrow(questionId);
        applyRequest(existing, request);
        return QuestionMapper.toResponse(questionRepository.save(existing));
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuestionResponse> getQuestions() {
        return questionRepository.findAll().stream().map(QuestionMapper::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public QuestionResponse getQuestion(Long questionId) {
        return QuestionMapper.toResponse(findQuestionOrThrow(questionId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuestionResponse> getQuestionsOfQuiz(Long quizId) {
        Quiz quiz = quizService.getQuizEntity(quizId);
        return questionRepository.findByQuiz(quiz).stream().map(QuestionMapper::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuestionResponse> getRandomQuestionsForUser(Long quizId) {
        Quiz quiz = quizService.getQuizEntity(quizId);
        List<Question> all = new ArrayList<>(questionRepository.findByQuiz(quiz));
        Collections.shuffle(all);

        int requested = Integer.parseInt(quiz.getNumberOfQuestions());
        List<Question> subset = all.size() > requested ? all.subList(0, requested) : all;

        return subset.stream().map(QuestionMapper::toUserResponse).toList();
    }

    @Override
    public void deleteQuestion(Long questionId) {
        if (!questionRepository.existsById(questionId)) {
            throw new ResourceNotFoundException("Question", "id", questionId);
        }
        questionRepository.deleteById(questionId);
    }

    private void applyRequest(Question question, QuestionRequest request) {
        question.setContent(request.content());
        question.setImage(request.image());
        question.setOption1(request.option1());
        question.setOption2(request.option2());
        question.setOption3(request.option3());
        question.setOption4(request.option4());
        question.setAnswer(request.answer());
        question.setQuiz(quizService.getQuizEntity(request.quizId()));
    }

    private Question findQuestionOrThrow(Long id) {
        return questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question", "id", id));
    }
}
