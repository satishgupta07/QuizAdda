package com.satishgupta.quizadda_server.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Externalized storage settings. Local-filesystem default is fine for dev /
 * portfolio; production would point at a mounted disk or swap the
 * {@code FileStorageService} implementation for S3/Cloudinary.
 */
@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "app.storage")
public class StorageProperties {

    /** Filesystem directory where uploaded files are written. */
    private String location = "./uploads";

    /** Public URL prefix used in returned file URLs. */
    private String publicUrl = "/uploads";
}
