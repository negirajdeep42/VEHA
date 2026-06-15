package com.veha.jewelry.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitFilter implements Filter {

    private final Map<String, TokenBucket> buckets = new ConcurrentHashMap<>();

    private static class TokenBucket {
        private final long capacity = 5; // Max capacity
        private double tokens = 5.0;     // Current tokens
        private Instant lastRefill = Instant.now();
        private final double refillRatePerSecond = 0.2; // 1 token every 5 seconds

        public synchronized boolean tryConsume() {
            refill();
            if (tokens >= 1.0) {
                tokens -= 1.0;
                return true;
            }
            return false;
        }

        private void refill() {
            Instant now = Instant.now();
            double elapsedSeconds = (now.toEpochMilli() - lastRefill.toEpochMilli()) / 1000.0;
            lastRefill = now;
            tokens = Math.min(capacity, tokens + (elapsedSeconds * refillRatePerSecond));
        }
    }

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {}

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        
        String path = httpRequest.getRequestURI();
        
        // Rate limit sensitive authentication endpoints
        if (path.equals("/api/auth/login") || 
            path.equals("/api/auth/register") || 
            path.equals("/api/auth/forgot-password") || 
            path.equals("/api/auth/reset-password")) {
            
            String ip = httpRequest.getRemoteAddr();
            TokenBucket bucket = buckets.computeIfAbsent(ip, k -> new TokenBucket());
            
            if (!bucket.tryConsume()) {
                httpResponse.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                httpResponse.setContentType("application/json");
                httpResponse.getWriter().write("{\"message\": \"Too many requests. Please try again later.\"}");
                return;
            }
        }
        
        chain.doFilter(request, response);
    }

    @Override
    public void destroy() {}
}
