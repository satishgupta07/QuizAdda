package com.satishgupta.quizadda_server.exceptions;

/**
 * Thrown when attempting to create a resource that conflicts with an existing one
 * (e.g. registering a user with a username that already exists). Translated to HTTP 409.
 */
public class DuplicateResourceException extends RuntimeException {

    public DuplicateResourceException(String message) {
        super(message);
    }
}
