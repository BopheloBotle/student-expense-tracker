package com.student.expensetracker.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class JwtProperties {

    @Value("${jwt.secret:my-secret-key-which-should-be-long}")
    private String secret;

    @Value("${jwt.expiration:60}")
    private long expirationMinutes;

    @Value("${jwt.issuer:expense-tracker}")
    private String issuer;

    public String getSecret() {
        return secret;
    }

    public long getExpirationMinutes() {
        return expirationMinutes;
    }

    public String getIssuer() {
        return issuer;
    }
}