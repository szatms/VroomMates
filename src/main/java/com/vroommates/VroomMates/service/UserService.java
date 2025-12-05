package com.vroommates.VroomMates.service;

import com.vroommates.VroomMates.model.usermodel.User;
import com.vroommates.VroomMates.model.usermodel.UserRepository;
import com.vroommates.VroomMates.model.usermodel.dto.*;
import com.vroommates.VroomMates.model.usermodel.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

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

        // Token majd később kerül bele
        AuthResponseDTO auth = new AuthResponseDTO();
        auth.setUser(response);
        auth.setAccessToken("TEMPORARY_TOKEN"); // később JWT

        return auth;
    }

    // -----------------------------------------------------------
    // LOGIN
    // -----------------------------------------------------------
    public AuthResponseDTO login(UserLoginDTO dto) {

        // user keresése email alapján
        User user = userRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        // jelszó ellenőrzés
        if (!passwordEncoder.matches(dto.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid email or password");
        }

        // Response DTO készítése
        UserResponseDTO response = userMapper.toResponseDTO(user);

        // token majd később
        AuthResponseDTO auth = new AuthResponseDTO();
        auth.setUser(response);
        auth.setAccessToken("TEMPORARY_TOKEN");

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
}
