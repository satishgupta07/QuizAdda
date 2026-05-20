package com.satishgupta.quizadda_server.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

/**
 * Maps the public URL prefix configured in {@link StorageProperties} to the
 * on-disk directory so uploaded files can be served directly without a
 * controller.
 */
@Configuration
@RequiredArgsConstructor
public class WebMvcConfig implements WebMvcConfigurer {

    private final StorageProperties storage;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String absolutePath = Paths.get(storage.getLocation()).toAbsolutePath().toUri().toString();
        registry.addResourceHandler(storage.getPublicUrl() + "/**")
                .addResourceLocations(absolutePath);
    }
}
