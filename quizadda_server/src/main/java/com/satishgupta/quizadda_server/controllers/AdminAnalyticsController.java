package com.satishgupta.quizadda_server.controllers;

import com.satishgupta.quizadda_server.dto.admin.AnalyticsResponse;
import com.satishgupta.quizadda_server.services.AnalyticsService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Admin-only analytics. Restricted by {@code @PreAuthorize("hasAuthority('ADMIN')")}
 * — even an authenticated USER will get a 403.
 */
@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ADMIN')")
@Tag(name = "Admin", description = "Admin-only operations")
public class AdminAnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/analytics")
    public ResponseEntity<AnalyticsResponse> analytics() {
        return ResponseEntity.ok(analyticsService.computeAnalytics());
    }
}
