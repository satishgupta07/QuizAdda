package com.satishgupta.quizadda_server.services;

import com.satishgupta.quizadda_server.config.StorageProperties;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

/**
 * Saves uploaded files to the local filesystem and returns their public URL.
 * Image-only by design — accepting arbitrary file types is a path-traversal
 * and content-sniffing risk we don't need.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FileStorageService {

    /** Allowed MIME types — kept tight; expand only with deliberate review. */
    private static final Set<String> ALLOWED_TYPES = Set.of("image/png", "image/jpeg", "image/webp", "image/gif");
    private static final long MAX_BYTES = 2L * 1024 * 1024; // 2 MB

    private final StorageProperties storage;
    private Path root;

    @PostConstruct
    void init() throws IOException {
        root = Paths.get(storage.getLocation()).toAbsolutePath().normalize();
        Files.createDirectories(root);
        log.info("File storage initialized at: {}", root);
    }

    /**
     * Saves {@code file} under a randomized name and returns the URL clients
     * should use to fetch it.
     */
    public String storeImage(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }
        if (file.getSize() > MAX_BYTES) {
            throw new IllegalArgumentException("File exceeds the 2 MB limit");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Unsupported file type. Use PNG, JPG, WEBP, or GIF.");
        }

        String ext = switch (contentType.toLowerCase()) {
            case "image/png"  -> ".png";
            case "image/jpeg" -> ".jpg";
            case "image/webp" -> ".webp";
            case "image/gif"  -> ".gif";
            default           -> ".bin"; // unreachable thanks to the check above
        };

        String filename = UUID.randomUUID() + ext;
        Path target = root.resolve(filename).normalize();
        // Defense in depth — refuse anything that resolves outside the root.
        if (!target.startsWith(root)) {
            throw new IllegalArgumentException("Invalid file path");
        }

        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        return storage.getPublicUrl() + "/" + filename;
    }
}
