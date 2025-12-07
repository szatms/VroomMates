package com.vroommates.VroomMates.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private long jwtExpirationMs;

    // =====================================================
    // SIGNING KEY
    // =====================================================
    private SecretKey getSigningKey() {
        try {
            byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
            return Keys.hmacShaKeyFor(keyBytes);
        } catch (Exception e) {
            throw new RuntimeException("Invalid JWT secret key format", e);
        }
    }

    // =====================================================
    // GENERATE TOKEN
    // =====================================================
    public String generateToken(Integer userId, String role) {
        return Jwts.builder()
                .setSubject(userId.toString())
                .claim("role", role) // pl: DRIVER, USER, ADMIN
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // =====================================================
    // VALIDATE TOKEN
    // =====================================================
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token);  // ha exception, akkor invalid

            return true;

        } catch (JwtException | IllegalArgumentException e) {
            System.out.println("JWT VALIDATION ERROR: " + e.getMessage());
            return false;
        }
    }

    // =====================================================
    // EXTRACT USER ID
    // =====================================================
    public Integer extractUserId(String token) {
        try {
            Claims claims = extractAllClaims(token);
            return Integer.parseInt(claims.getSubject());
        } catch (Exception e) {
            return null;
        }
    }

    // =====================================================
    // EXTRACT ROLE
    // =====================================================
    public String extractRole(String token) {
        try {
            Claims claims = extractAllClaims(token);
            return claims.get("role", String.class);
        } catch (Exception e) {
            return null;
        }
    }

    // =====================================================
    // EXTRACT ALL CLAIMS (központi helyen)
    // =====================================================
    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
