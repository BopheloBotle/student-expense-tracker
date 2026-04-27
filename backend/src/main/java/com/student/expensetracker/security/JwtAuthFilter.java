package com.student.expensetracker.security;

import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {
	private final JwtService jwt;
	private final AppUserDetailsService users;

	public JwtAuthFilter(JwtService jwt, AppUserDetailsService users) {
		this.jwt = jwt;
		this.users = users;
	}

	@Override
protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain)
        throws ServletException, IOException {

    String path = request.getRequestURI();

    if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
        filterChain.doFilter(request, response);
        return;
    }

    // ✅ SKIP AUTH ENDPOINTS
    if (path.startsWith("/api/auth/")) {
        filterChain.doFilter(request, response);
        return;
    }

    String header = request.getHeader("Authorization");

    if (header == null || !header.regionMatches(true, 0, "Bearer ", 0, 7)) {
        filterChain.doFilter(request, response);
        return;
    }

    try {
        String token = header.substring(7).trim();
        var claims = jwt.parse(token);

        String email = claims.getSubject();

        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            var principal = (AppUserPrincipal) users.loadUserByUsername(email);

            var auth = new UsernamePasswordAuthenticationToken(
                    principal,
                    null,
                    principal.getAuthorities()
            );

            auth.setDetails(
                    new WebAuthenticationDetailsSource().buildDetails(request)
            );

            SecurityContextHolder.getContext().setAuthentication(auth);
        }

    } catch (JwtException | IllegalArgumentException | UsernameNotFoundException ignored) {
        // invalid token, or user removed from DB — continue without auth
    }

    filterChain.doFilter(request, response);
}
}

