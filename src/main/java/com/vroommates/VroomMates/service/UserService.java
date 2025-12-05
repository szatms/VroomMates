package com.vroommates.VroomMates.service;

import com.vroommates.VroomMates.model.usermodel.User;
import com.vroommates.VroomMates.model.usermodel.UserRepository;
import com.vroommates.VroomMates.model.usermodel.dto.*;
import com.vroommates.VroomMates.model.usermodel.mapper.UserMapper;
import com.vroommates.VroomMates.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import com.vroommates.VroomMates.security.SecurityUser;
import org.springframework.security.authentication.BadCredentialsException;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    // -----------------------------------------------------------
    // REGISZTRÁCIÓ
    // -----------------------------------------------------------
    public AuthResponseDTO register(UserCreateDTO dto) {

        // email ütközés?
        if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new RuntimeException("Email already in use");
        }

        // jelszó hash
        String hashed = passwordEncoder.encode(dto.getPassword());

        // DTO → Entity
        User user = userMapper.fromCreateDTO(dto, hashed);

        // mentés
        userRepository.save(user);

        // Entity → Response DTO
        UserResponseDTO response = userMapper.toResponseDTO(user);

        // szerep meghatározása (mert kell a tokenhez)
        String role = user.getIsAdmin() != null && user.getIsAdmin() ? "ADMIN"
                : user.getIsDriver() != null && user.getIsDriver() ? "DRIVER"
                : "USER";

        // token generálás
        String token = jwtService.generateToken(user.getUserId(), role);

        AuthResponseDTO auth = new AuthResponseDTO();
        auth.setUser(response);
        auth.setAccessToken(token);

        return auth;

    }

    // -----------------------------------------------------------
    // LOGIN
    // -----------------------------------------------------------
    public AuthResponseDTO login(UserLoginDTO dto) {

        // user keresése email alapján (email nem létezik)
        User user = userRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        // jelszó ellenőrzése (rossz jelszó)
        if (!passwordEncoder.matches(dto.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        // Response DTO készítése
        UserResponseDTO response = userMapper.toResponseDTO(user);

        // role lekérése stb…
        String role = user.getIsAdmin() ? "ADMIN" :
                user.getIsDriver() ? "DRIVER" : "USER";

        String token = jwtService.generateToken(user.getUserId(), role);

        AuthResponseDTO auth = new AuthResponseDTO();
        auth.setUser(response);
        auth.setAccessToken(token);

        return auth;
    }

    // -----------------------------------------------------------
    // USER LEKÉRÉSE ID ALAPJÁN
    // -----------------------------------------------------------
    public UserResponseDTO getUserById(Integer id) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return userMapper.toResponseDTO(user);
    }

    // -----------------------------------------------------------
    // USER FRISSÍTÉSE
    // -----------------------------------------------------------
    public UserResponseDTO updateUser(Integer id, UserUpdateDTO dto) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        userMapper.updateEntityFromDTO(dto, user);

        userRepository.save(user);  // fontos: mentés

        return userMapper.toResponseDTO(user);
    }

    // -----------------------------------------------------------
    // AKTUÁLIS USER
    // -----------------------------------------------------------
    public UserResponseDTO getCurrentUser() {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !(authentication.getPrincipal() instanceof SecurityUser securityUser)) {
            throw new RuntimeException("User not authenticated");
        }

        // SecurityUser.getUser() → visszaadja az entitást
        return userMapper.toResponseDTO(securityUser.getUser());
    }

}
