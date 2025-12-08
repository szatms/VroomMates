package com.vroommates.VroomMates;

import com.vroommates.VroomMates.security.JwtService;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import java.security.Key;
import java.util.Date;
import static org.assertj.core.api.Assertions.assertThat;

public class VroomMatesJwtServiceTests {
    private JwtService jwtService;
    private final String TEST_SECRET = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";
    private final long TEST_EXPIRATION = 3600000;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "jwtSecret", TEST_SECRET);
        ReflectionTestUtils.setField(jwtService, "jwtExpirationMs", TEST_EXPIRATION);
    }

    @Test
    void generateToken_ShouldCreateValidToken() {
        // ACT
        String token = jwtService.generateToken(123, "DRIVER");

        // ASSERT
        assertThat(token).isNotNull();
        assertThat(token).isNotEmpty();

        boolean isValid = jwtService.validateToken(token);
        assertThat(isValid).isTrue();
    }

    @Test
    void extractUserId_ShouldReturnCorrectId() {
        // ARRANGE
        String token = jwtService.generateToken(123, "USER");

        // ACT
        Integer userId = jwtService.extractUserId(token);

        // ASSERT
        assertThat(userId).isEqualTo(123);
    }

    @Test
    void extractRole_ShouldReturnCorrectRole() {
        // ARRANGE
        String token = jwtService.generateToken(456, "ADMIN");

        // ACT
        String role = jwtService.extractRole(token);

        // ASSERT
        assertThat(role).isEqualTo("ADMIN");
    }

    @Test
    void validateToken_ShouldReturnFalse_WhenTokenIsExpired() {
        // ARRANGE
        byte[] keyBytes = Decoders.BASE64.decode(TEST_SECRET);
        Key key = Keys.hmacShaKeyFor(keyBytes);

        String expiredToken = Jwts.builder()
                .setSubject("123")
                .setExpiration(new Date(System.currentTimeMillis() - 1000)) // 1 másodperce lejárt
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();

        // ACT
        boolean isValid = jwtService.validateToken(expiredToken);

        // ASSERT
        assertThat(isValid).isFalse();
    }

    @Test
    void validateToken_ShouldReturnFalse_WhenSignatureIsInvalid() {
        // ARRANGE:
        String token = jwtService.generateToken(123, "USER");

        String tamperedToken = token.substring(0, token.length() - 1);

        // ACT
        boolean isValid = jwtService.validateToken(tamperedToken);

        // ASSERT
        assertThat(isValid).isFalse();
    }
}
