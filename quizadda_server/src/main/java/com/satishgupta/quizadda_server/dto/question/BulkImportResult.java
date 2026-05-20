package com.satishgupta.quizadda_server.dto.question;

import java.util.List;

/**
 * Summary of a CSV import. {@code imported} is the count that succeeded;
 * {@code errors} lists per-row failures so the admin can fix them and retry.
 */
public record BulkImportResult(
        int imported,
        int skipped,
        List<RowError> errors
) {
    public record RowError(int rowNumber, String message) { }
}
