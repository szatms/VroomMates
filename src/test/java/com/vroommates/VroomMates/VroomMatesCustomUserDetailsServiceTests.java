package com.vroommates.VroomMates;

import com.vroommates.VroomMates.model.usermodel.User;
import com.vroommates.VroomMates.model.usermodel.UserRepository;
import com.vroommates.VroomMates.security.CustomUserDetailsService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import java.util.Optional;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class VroomMatesCustomUserDetailsServiceTests {
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CustomUserDetailsService userDetailsService;

    @Test
    void loadUserByUsername_ShouldReturnUserDetails_WhenUserExists() {
        // ARRANGE
        User user = User.builder()
                .email("test@example.com")
                .passwordHash("hashedPass")
                .isAdmin(true)
                .build();

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));

        // ACT
        UserDetails result = userDetailsService.loadUserByUsername("test@example.com");

        // ASSERT
        assertThat(result).isNotNull();
        assertThat(result.getUsername()).isEqualTo("test@example.com");
        assertThat(result.getPassword()).isEqualTo("hashedPass");

        assertThat(result.getAuthorities())
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }

    @Test
    void loadUserByUsername_ShouldThrowException_WhenUserNotFound() {
        // ARRANGE
        when(userRepository.findByEmail("ghost@example.com")).thenReturn(Optional.empty());

        // ACT & ASSERT
        assertThrows(UsernameNotFoundException.class, () ->
                userDetailsService.loadUserByUsername("ghost@example.com")
        );
    }

    @Test
    void loadUserById_ShouldReturnUserDetails_WhenUserExists() {
        // ARRANGE
        User user = User.builder().userId(100).email("id@example.com").build();
        when(userRepository.findById(100)).thenReturn(Optional.of(user));

        // ACT
        UserDetails result = userDetailsService.loadUserById(100);

        // ASSERT
        assertThat(result.getUsername()).isEqualTo("id@example.com");
    }
}
