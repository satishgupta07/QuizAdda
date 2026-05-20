package com.satishgupta.quizadda_server.models.quizPortal;

/**
 * Difficulty band displayed alongside a quiz. Used for filtering on the user
 * dashboard. Stored as a string in the DB so renames don't require a data
 * migration.
 */
public enum Difficulty {
    EASY,
    MEDIUM,
    HARD
}
