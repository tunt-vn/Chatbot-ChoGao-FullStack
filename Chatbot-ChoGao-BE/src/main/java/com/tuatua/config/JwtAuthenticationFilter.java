package com.tuatua.config;

import com.tuatua.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor // Tự động tạo constructor cho các trường final
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userEmail;

        log.debug("Processing request: {} {}", request.getMethod(), request.getRequestURI());
        System.out.println("DEBUG: Filter processing " + request.getRequestURI());
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            System.out.println("DEBUG: No valid Auth header found: " + authHeader);
            log.debug("No JWT token found in request");
            filterChain.doFilter(request, response); // Nếu không có token, cho qua
            return;
        }

        jwt = authHeader.substring(7); // Bỏ "Bearer "
        log.debug("JWT token found: {}", jwt.substring(0, Math.min(20, jwt.length())) + "...");
        
        try {
            userEmail = jwtService.extractUsername(jwt); // Trích xuất email từ token
            log.debug("Extracted username from token: {}", userEmail);

            // Nếu có email và người dùng chưa được xác thực trong SecurityContext
            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);
                log.debug("Loaded user details for: {}", userEmail);

                // Giả sử JwtService của bạn có phương thức isTokenValid
                boolean isValid = jwtService.isTokenValid(jwt, userDetails);
                System.out.println("DEBUG: Token valid for " + userEmail + "? " + isValid);
                if (isValid) {
                    // Tạo đối tượng xác thực
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );
                    authToken.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request)
                    );
                    // Cập nhật SecurityContext
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    log.debug("Authentication set in SecurityContext for user: {}", userEmail);
                } else {
                    System.out.println("DEBUG: Token invalid for " + userEmail);
                    log.warn("JWT token is invalid or expired for user: {}", userEmail);
                }
            }
        } catch (Exception e) {
            log.error("Error processing JWT token: {}", e.getMessage());
        }
        
        filterChain.doFilter(request, response);
    }
}
