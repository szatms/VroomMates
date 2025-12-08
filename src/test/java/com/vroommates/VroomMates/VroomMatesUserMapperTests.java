package com.vroommates.VroomMates;

import com.vroommates.VroomMates.model.usermodel.User;
import com.vroommates.VroomMates.model.usermodel.dto.UserResponseDTO;
import com.vroommates.VroomMates.model.usermodel.dto.UserUpdateDTO;
import com.vroommates.VroomMates.model.usermodel.mapper.UserMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.time.LocalDateTime;
import static org.assertj.core.api.Assertions.assertThat;

public class VroomMatesUserMapperTests {
    private UserMapper userMapper;

    @BeforeEach
    void setUp(){
        userMapper = new UserMapper();
    }

    @Test
    void toResponseDTO_ShouldSetRoleToAdmin_WhenUserIsAdmin(){
        // ARRANGE
        User adminUser = User.builder()
                .userId(1)
                .isAdmin(true)
                .isDriver(true)
                .build();

        // ACT
        UserResponseDTO result = userMapper.toResponseDTO(adminUser);

        //ASSERT
        assertThat(result.getRole()).isEqualTo("ADMIN");
    }

    @Test
    void toResponseDTO_ShouldSetRoleToDriver_WhenUserIsDriver(){
        // ARRANGE
        User driverUser = User.builder()
                .userId(2)
                .isAdmin(false)
                .isDriver(true)
                .build();

        // ACT
        UserResponseDTO result = userMapper.toResponseDTO(driverUser);

        // ASSERT
        assertThat(result.getRole()).isEqualTo("DRIVER");
    }

    @Test
    void updateEntityFromDTO_ShouldUpdateFieldsAndTimestamp() {
        // ARRANGE
        User user = User.builder()
                .displayName("OldName Test")
                .isDriver(false)
                .updatedAt(LocalDateTime.now().minusDays(1))
                .build();

        UserUpdateDTO updateDTO = new UserUpdateDTO();
        updateDTO.setDisplayName("NewName Test");
        updateDTO.setDriver(true);
        updateDTO.setLat(10.5);
        updateDTO.setLon(20.5);

        // ACT
        userMapper.updateEntityFromDTO(updateDTO, user);

        // ASSERT
        assertThat(user.getDisplayName()).isEqualTo("NewName Test");
        assertThat(user.getIsDriver()).isTrue();
        assertThat(user.getLat()).isEqualTo(10.5f);

        assertThat(user.getUpdatedAt()).isAfter(LocalDateTime.now().minusMinutes(1));
    }
}
