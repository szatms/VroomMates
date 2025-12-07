package com.vroommates.VroomMates.config;

import com.vroommates.VroomMates.security.CustomUserDetailsService;
import com.vroommates.VroomMates.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final CustomUserDetailsService userDetailsService;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                // REST API → stateless + CSRF off
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                // 🔐 Auth szabályok – most direkt egyszerűre vesszük:
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()
                        // minden más API-hoz elég, ha be vagy jelentkezve JWT-vel
                        .requestMatchers("/api/**").authenticated()
                        .anyRequest().permitAll()
                )

                // 🔐 AuthenticationProvider – ez köti be a CustomUserDetailsService-et
                .authenticationProvider(authenticationProvider())

                // 🔐 JWT filter a láncba
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // Itt mondjuk meg Spring-nek, hogyan töltse be a usert és hogyan ellenőrizze a jelszót
    @Bean
    public AuthenticationProvider authenticationProvider() {
        // A TE Spring Security verziód alapján: CSAK 1 paraméteres konstruktor van
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    // Ha valahol AuthenticationManager kell (pl. login service-ben), innen jön
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config)
            throws Exception {
        return config.getAuthenticationManager();
    }

    // Bcrypt hashelés (már használod)
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
