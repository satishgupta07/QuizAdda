package com.satishgupta.quizadda_server.services;

import com.satishgupta.quizadda_server.dto.question.BulkImportResult;
import com.satishgupta.quizadda_server.models.quizPortal.Question;
import com.satishgupta.quizadda_server.models.quizPortal.Quiz;
import com.satishgupta.quizadda_server.repositories.QuestionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

/**
 * Parses uploaded CSV files into {@link Question} rows. Format (header row required):
 * <pre>
 * content,option1,option2,option3,option4,answer[,image]
 * </pre>
 * The {@code answer} value must match one of the four options exactly. Rows
 * with parse or validation failures are reported back to the caller — they
 * don't abort the rest of the import.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class QuestionImportService {

    private static final int MIN_COLUMNS = 6;
    private static final int MAX_ROWS = 500;

    private final QuestionRepository questionRepository;
    private final QuizService quizService;

    public BulkImportResult importCsv(Long quizId, MultipartFile file) throws IOException {
        Quiz quiz = quizService.getQuizEntity(quizId);

        List<BulkImportResult.RowError> errors = new ArrayList<>();
        List<Question> toSave = new ArrayList<>();
        int rowNumber = 0;
        int skipped = 0;

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {

            String line = reader.readLine();
            rowNumber++;
            if (line == null) {
                throw new IllegalArgumentException("CSV is empty");
            }
            // First line is the header; skip it but validate column count.
            if (parseCsvLine(line).size() < MIN_COLUMNS) {
                throw new IllegalArgumentException(
                        "Header must have columns: content,option1,option2,option3,option4,answer[,image]");
            }

            while ((line = reader.readLine()) != null) {
                rowNumber++;
                if (line.isBlank()) {
                    skipped++;
                    continue;
                }
                if (toSave.size() >= MAX_ROWS) {
                    errors.add(new BulkImportResult.RowError(rowNumber,
                            "Row exceeds %d-row limit; truncated".formatted(MAX_ROWS)));
                    break;
                }

                List<String> cols = parseCsvLine(line);
                if (cols.size() < MIN_COLUMNS) {
                    errors.add(new BulkImportResult.RowError(rowNumber,
                            "Expected at least %d columns, got %d".formatted(MIN_COLUMNS, cols.size())));
                    continue;
                }

                String content = cols.get(0).trim();
                String o1 = cols.get(1).trim();
                String o2 = cols.get(2).trim();
                String o3 = cols.get(3).trim();
                String o4 = cols.get(4).trim();
                String answer = cols.get(5).trim();
                String image  = cols.size() > 6 ? cols.get(6).trim() : null;

                if (content.isEmpty() || o1.isEmpty() || o2.isEmpty() || o3.isEmpty() || o4.isEmpty() || answer.isEmpty()) {
                    errors.add(new BulkImportResult.RowError(rowNumber, "Empty value in required column"));
                    continue;
                }
                if (!answer.equals(o1) && !answer.equals(o2) && !answer.equals(o3) && !answer.equals(o4)) {
                    errors.add(new BulkImportResult.RowError(rowNumber,
                            "Answer must match exactly one of the four options"));
                    continue;
                }

                Question q = new Question();
                q.setQuiz(quiz);
                q.setContent(content);
                q.setOption1(o1);
                q.setOption2(o2);
                q.setOption3(o3);
                q.setOption4(o4);
                q.setAnswer(answer);
                if (image != null && !image.isEmpty()) q.setImage(image);
                toSave.add(q);
            }
        }

        if (!toSave.isEmpty()) {
            questionRepository.saveAll(toSave);
        }
        log.info("Bulk import for quiz {}: {} rows imported, {} errors", quizId, toSave.size(), errors.size());
        return new BulkImportResult(toSave.size(), skipped, errors);
    }

    /**
     * Minimal CSV parser supporting quoted fields with embedded commas / escaped
     * quotes via doubled {@code ""}. Not RFC-4180-complete (no multi-line cells)
     * but good enough for the admin paste-from-spreadsheet flow.
     */
    private List<String> parseCsvLine(String line) {
        List<String> out = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        boolean inQuotes = false;
        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);
            if (c == '"') {
                if (inQuotes && i + 1 < line.length() && line.charAt(i + 1) == '"') {
                    current.append('"');
                    i++; // skip the escaped quote
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (c == ',' && !inQuotes) {
                out.add(current.toString());
                current.setLength(0);
            } else {
                current.append(c);
            }
        }
        out.add(current.toString());
        return out;
    }
}
