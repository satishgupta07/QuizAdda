package com.satishgupta.quizadda_server.services;

import com.satishgupta.quizadda_server.dto.question.BulkImportResult;
import com.satishgupta.quizadda_server.models.quizPortal.Quiz;
import com.satishgupta.quizadda_server.repositories.QuestionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.nio.charset.StandardCharsets;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

/**
 * Exercises the CSV import service end-to-end (parse + validate). Repositories
 * are mocked so the test stays a pure unit test.
 */
@ExtendWith(MockitoExtension.class)
class QuestionImportServiceTest {

    @Mock QuestionRepository questionRepository;
    @Mock QuizService quizService;
    @InjectMocks QuestionImportService service;

    private final Quiz quiz = new Quiz();

    @BeforeEach
    void setUp() {
        quiz.setQuizId(1L);
        when(quizService.getQuizEntity(1L)).thenReturn(quiz);
    }

    @Test
    void importsValidRowsAndReportsErrors() throws Exception {
        String csv = """
                content,option1,option2,option3,option4,answer
                What is 2+2?,3,4,5,6,4
                Bad row missing answer,3,4,5,6,
                Mismatched answer,A,B,C,D,Z
                """;

        BulkImportResult result = service.importCsv(1L, csv(csv));

        assertThat(result.imported()).isEqualTo(1);
        assertThat(result.errors())
                .hasSize(2)
                .extracting(BulkImportResult.RowError::rowNumber)
                .containsExactly(3, 4);
    }

    @Test
    void rejectsEmptyCsv() {
        org.junit.jupiter.api.Assertions.assertThrows(
                IllegalArgumentException.class,
                () -> service.importCsv(1L, csv(""))
        );
    }

    @Test
    void handlesQuotedCommasInsideFields() throws Exception {
        String csv = """
                content,option1,option2,option3,option4,answer
                "Pick the city, please","Paris, France","London","Tokyo","Cairo","Paris, France"
                """;

        BulkImportResult result = service.importCsv(1L, csv(csv));
        assertThat(result.imported()).isEqualTo(1);
        assertThat(result.errors()).isEmpty();
    }

    private MockMultipartFile csv(String body) {
        return new MockMultipartFile("file", "q.csv", "text/csv", body.getBytes(StandardCharsets.UTF_8));
    }
}
