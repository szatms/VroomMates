package com.vroommates.VroomMates;

import com.vroommates.VroomMates.model.usermodel.User;
import com.vroommates.VroomMates.model.usermodel.UserRepository;
import com.vroommates.VroomMates.model.usermodel.dto.*;
import com.vroommates.VroomMates.model.usermodel.mapper.UserMapper;
import com.vroommates.VroomMates.security.JwtService;
import com.vroommates.VroomMates.service.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class VroomMatesUserServiceTests {
    @Mock
    UserRepository userRepository;

    @Mock
    UserMapper userMapper;

    @Mock
    PasswordEncoder passwordEncoder;

    @Mock
    JwtService jwtService;

    @InjectMocks
    UserService userService;

    // REGISTRATION TESTS
    @Test
    void register_ShouldRegisterUser_WhenEmailIsUnique(){
        // ARRANGE
        UserCreateDTO createDTO = new UserCreateDTO();
        createDTO.setEmail("newTest@example.com");
        createDTO.setPassword("testPassword");
        createDTO.setDriver(true);

        User mappedUser = User.builder()
                .userId(1)
                .email("newTest@example.com")
                .isDriver(true)
                .isAdmin(false)
                .build();

        UserResponseDTO responseDTO = new UserResponseDTO();
        responseDTO.setEmail("newTest@example.com");

        // Check email: no user
        when(userRepository.findByEmail(createDTO.getEmail())).thenReturn(Optional.empty());
        // Password hash
        when(passwordEncoder.encode("testPassword")).thenReturn("hashedPassword");
        // Calling Mapper
        when(userMapper.fromCreateDTO(eq(createDTO), eq("hashedPassword"))).thenReturn(mappedUser);
        // Mapper response
        when(userMapper.toResponseDTO(mappedUser)).thenReturn(responseDTO);
        // Generating token
        when(jwtService.generateToken(1, "DRIVER")).thenReturn("mock-jwt-token");

        // ACT
        AuthResponseDTO result = userService.register(createDTO);

        // ASSERT
        assertThat(result.getAccessToken()).isEqualTo("mock-jwt-token");
        assertThat(result.getUser()).isEqualTo(responseDTO);

        // Verify saving
        verify(userRepository).save(mappedUser);
    }

    @Test
    void register_ShouldThrowException_WhenEmailAlreadyExists() {
        // ARRANGE
        UserCreateDTO createDTO = new UserCreateDTO();
        createDTO.setEmail("existing@example.com");

        when(userRepository.findByEmail(createDTO.getEmail())).thenReturn(Optional.of(new User()));

        // ACT & ASSERT
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            userService.register(createDTO);
        });

        assertThat(exception.getMessage()).isEqualTo("Email already in use");

        verify(userRepository, never()).save(any());
    }


    // LOGIN TESTS
    @Test
    void login_ShouldReturnToken_WhenCredentialsAreCorrect() {
        // ARRANGE
        UserLoginDTO loginDTO = new UserLoginDTO();
        loginDTO.setEmail("test@example.com");
        loginDTO.setPassword("password123");

        User existingUser = User.builder()
                .userId(10)
                .email("test@example.com")
                .passwordHash("hashedPassword123")
                .isAdmin(true)
                .build();

        UserResponseDTO responseDTO = new UserResponseDTO();

        when(userRepository.findByEmail(loginDTO.getEmail())).thenReturn(Optional.of(existingUser));
        when(passwordEncoder.matches("password123", "hashedPassword123")).thenReturn(true);
        when(userMapper.toResponseDTO(existingUser)).thenReturn(responseDTO);

        when(jwtService.generateToken(10, "ADMIN")).thenReturn("admin-token");

        // ACT
        AuthResponseDTO result = userService.login(loginDTO);

        // ASSERT
        assertThat(result.getAccessToken()).isEqualTo("admin-token");
    }

    @Test
    void login_ShouldThrowBadCredentials_WhenPasswordIsWrong() {
        // ARRANGE
        UserLoginDTO loginDTO = new UserLoginDTO();
        loginDTO.setEmail("test@example.com");
        loginDTO.setPassword("wrongPassword");

        User existingUser = User.builder()
                .email("test@example.com")
                .passwordHash("correctHash")
                .build();

        when(userRepository.findByEmail(loginDTO.getEmail())).thenReturn(Optional.of(existingUser));

        when(passwordEncoder.matches("wrongPassword", "correctHash")).thenReturn(false);

        // ACT & ASSERT
        assertThrows(BadCredentialsException.class, () -> {
            userService.login(loginDTO);
        });


        verify(jwtService, never()).generateToken(any(), any());
    }

    @Test
    void login_ShouldThrowBadCredentials_WhenUserNotFound() {
        // ARRANGE
        UserLoginDTO loginDTO = new UserLoginDTO();
        loginDTO.setEmail("ghost@example.com");

        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        // ACT & ASSERT
        assertThrows(BadCredentialsException.class, () -> userService.login(loginDTO));
    }


    // UPDATE TESTS
    @Test
    void updateUser_ShouldUpdateAndSave() {
        // ARRANGE
        Integer userId = 1;
        UserUpdateDTO updateDTO = new UserUpdateDTO();
        User existingUser = new User();
        UserResponseDTO expectedResponse = new UserResponseDTO();

        when(userRepository.findById(userId)).thenReturn(Optional.of(existingUser));
        when(userMapper.toResponseDTO(existingUser)).thenReturn(expectedResponse);

        // ACT
        userService.updateUser(userId, updateDTO);

        // ASSERT
        verify(userMapper).updateEntityFromDTO(updateDTO, existingUser);

        verify(userRepository).save(existingUser);
    }
}
