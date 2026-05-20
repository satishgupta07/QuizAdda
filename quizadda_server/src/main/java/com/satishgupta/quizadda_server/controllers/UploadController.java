package com.satishgupta.quizadda_server.controllers;

import com.satishgupta.quizadda_server.services.FileStorageService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

/**
 * File upload endpoints. Restricted to ADMIN since only admins create quiz
 * content. Returned URL is relative to the API host.
 */
@RestController
@RequestMapping("/api/v1/uploads")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ADMIN')")
@Tag(name = "Uploads", description = "File upload endpoints (admin-only)")
public class UploadController {

    private final FileStorageService fileStorageService;

    @PostMapping("/image")
    public ResponseEntity<Map<String, String>> uploadImage(@RequestParam("file") MultipartFile file) throws IOException {
        String url = fileStorageService.storeImage(file);
        return ResponseEntity.ok(Map.of("url", url));
    }
}
