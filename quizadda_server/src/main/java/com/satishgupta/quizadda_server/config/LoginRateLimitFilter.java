package com.satishgupta.quizadda_server.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.satishgupta.quizadda_server.dto.ApiError;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Crude in-memory rate limiter for the login endpoint to slow down brute-force
 * attacks. Keys by client IP. Resets the window after {@link #WINDOW_SECONDS}
 * of inactivity. Production: replace with Bucket4j + Redis so the limit is
 * shared across server instances.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class LoginRateLimitFilter extends OncePerRequestFilter {

    private static final String LOGIN_PATH = "/api/v1/auth/login";
    private static final int MAX_ATTEMPTS = 10;
    private static final int WINDOW_SECONDS = 60;

    private final ObjectMapper objectMapper;
    private final Map<String, Window> buckets = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        if (!LOGIN_PATH.equals(request.getRequestURI()) || !"POST".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        String key = clientIp(request);
        Window window = buckets.compute(key, (k, existing) -> {
            long now = Instant.now().getEpochSecond();
            if (existing == null || now - existing.windowStart >= WINDOW_SECONDS) {
                return new Window(now, new AtomicInteger(1));
            }
            existing.attempts.incrementAndGet();
            return existing;
        });

        if (window.attempts.get() > MAX_ATTEMPTS) {
            log.warn("Rate-limited login attempt from {}", key);
            writeTooManyRequests(request, response);
            return;
        }

        filterChain.doFilter(request, response);
    }

    private void writeTooManyRequests(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        ApiError body = ApiError.builder()
                .timestamp(Instant.now())
                .status(HttpStatus.TOO_MANY_REQUESTS.value())
                .error(HttpStatus.TOO_MANY_REQUESTS.getReasonPhrase())
                .message("Too many login attempts. Try again in a minute.")
                .path(req.getRequestURI())
                .build();
        resp.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        resp.setContentType(MediaType.APPLICATION_JSON_VALUE);
        // Retry-After header is the standard signal to well-behaved clients.
        resp.setHeader("Retry-After", String.valueOf(WINDOW_SECONDS));
        objectMapper.writeValue(resp.getWriter(), body);
    }

    private String clientIp(HttpServletRequest request) {
        // Honor common reverse-proxy header so Render/Vercel/etc. don't all
        // collapse to a single IP. First entry in the comma-separated list is
        // the original client.
        String xff = request.getHeader("X-Forwarded-For");
        if (StringUtils.hasText(xff)) {
            int comma = xff.indexOf(',');
            return (comma > 0 ? xff.substring(0, comma) : xff).trim();
        }
        return request.getRemoteAddr();
    }

    private record Window(long windowStart, AtomicInteger attempts) { }
}
