package com.vroommates.VroomMates.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.nio.charset.StandardCharsets;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String jwtSecret;   // application.properties-ben adjuk meg

    @Value("${jwt.expiration}")
    private long jwtExpirationMs;  // pl. 86400000 = 24 óra

    // ----------------------------------------------------
    // SECRET KULCS GENERÁLÁSA
    // ----------------------------------------------------
    private SecretKey getSigningKey() {
        try {
            byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
            return Keys.hmacShaKeyFor(keyBytes);
        } catch (Exception e) {
            throw e;
        }
    }

    // ----------------------------------------------------
    // TOKEN GENERÁLÁS
    // ----------------------------------------------------
    public String generateToken(Integer userId, String role) {
        String token = Jwts.builder()
                .setSubject(userId.toString())
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
        return token;
    }

    // ----------------------------------------------------
    // TOKEN VALIDÁLÁS
    // ----------------------------------------------------
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token);

            System.out.println("DEBUG validateToken(): result = TRUE");
            return true;

        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    // ----------------------------------------------------
    // USER ID KIOLVASÁSA TOKENBŐL
    // ----------------------------------------------------
    public Integer extractUserId(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            return Integer.valueOf(claims.getSubject());

        } catch (Exception e) {
            return null;
        }
    }

    // ----------------------------------------------------
    // ROLE KIOLVASÁSA TOKENBŐL
    // ----------------------------------------------------
    public String extractRole(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            String role = claims.get("role", String.class);
            return role;
        } catch (Exception e) {
            return null;
        }
    }
}
