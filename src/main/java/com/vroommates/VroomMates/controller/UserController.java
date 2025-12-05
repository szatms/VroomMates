package com.vroommates.VroomMates.controller;

import com.vroommates.VroomMates.model.usermodel.dto.*;
import com.vroommates.VroomMates.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class UserController {

    private final UserService userService;

    // -----------------------------------------
    // REGISZTRÁCIÓ
    // -----------------------------------------
    @PostMapping("/auth/register")
    public ResponseEntity<AuthResponseDTO> register(@RequestBody UserCreateDTO dto) {
        return ResponseEntity.ok(userService.register(dto));
    }

    // -----------------------------------------
    // LOGIN
    // -----------------------------------------
    @PostMapping("/auth/login")
    public ResponseEntity<AuthResponseDTO> login(@RequestBody UserLoginDTO dto) {
        return ResponseEntity.ok(userService.login(dto));
    }

    // -----------------------------------------
    // USER LEKÉRÉSE ID ALAPJÁN
    // -----------------------------------------
    @GetMapping("/users/{id}")
    public ResponseEntity<UserResponseDTO> getUser(@PathVariable Integer id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    // -----------------------------------------
    // USER FRISSÍTÉSE
    // -----------------------------------------
    @PutMapping("/users/{id}")
    public ResponseEntity<UserResponseDTO> updateUser(
            @PathVariable Integer id,
            @RequestBody UserUpdateDTO dto
    ) {
        return ResponseEntity.ok(userService.updateUser(id, dto));
    }
}
