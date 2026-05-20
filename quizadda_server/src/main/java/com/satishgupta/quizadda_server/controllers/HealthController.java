package com.satishgupta.quizadda_server.controllers;

import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

/**
 * Trivial liveness ping. Frontend pokes this on startup to detect cold-start
 * delay on Render's free dyno (~30–60 s the first request after sleep).
 */
@RestController
@RequestMapping("/api/v1/health")
@Tag(name = "Health", description = "Liveness probe")
public class HealthController {

    @GetMapping
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "timestamp", Instant.now().toString()
        ));
    }
}
