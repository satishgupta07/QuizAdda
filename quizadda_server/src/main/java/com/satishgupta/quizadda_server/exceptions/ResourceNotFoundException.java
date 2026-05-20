package com.satishgupta.quizadda_server.exceptions;

/**
 * Thrown when a requested entity cannot be located by its identifier.
 * Translated to HTTP 404 by {@code GlobalExceptionHandler}.
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }

    public ResourceNotFoundException(String resource, String field, Object value) {
        super("%s not found with %s : '%s'".formatted(resource, field, value));
    }
}
