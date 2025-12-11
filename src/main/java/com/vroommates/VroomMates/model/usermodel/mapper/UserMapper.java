package com.vroommates.VroomMates.model.usermodel.mapper;

import com.vroommates.VroomMates.model.usermodel.User;
import com.vroommates.VroomMates.model.usermodel.dto.UserCreateDTO;
import com.vroommates.VroomMates.model.usermodel.dto.UserUpdateDTO;
import com.vroommates.VroomMates.model.usermodel.dto.UserResponseDTO;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class UserMapper {

    // ============================
    // CREATE DTO -> ENTITY
    // ============================
    public User fromCreateDTO(UserCreateDTO dto, String passwordHash) {
        return User.builder()
                .userId(null)
                .isAdmin(dto.isAdmin())
                .isDriver(dto.isDriver())
                .enabled(true)
                .lat(0.0)
                .lon(0.0)
                .userName(dto.getUserName())
                .passwordHash(passwordHash)
                .displayName(dto.getDisplayName())
                .email(dto.getEmail())
                .pfp("/images/avatar-placeholder.png")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .distance(0.0)
                .co2(0.0)
                .build();
    }

    // ============================
    // ENTITY -> RESPONSE DTO
    // ============================
    public UserResponseDTO toResponseDTO(User user) {
        UserResponseDTO dto = new UserResponseDTO();

        dto.setUserId(user.getUserId());
        dto.setUserName(user.getUserName());
        dto.setDisplayName(user.getDisplayName());
        dto.setEmail(user.getEmail());

        // Role meghatározás
        if (Boolean.TRUE.equals(user.getIsAdmin())) {
            dto.setRole("ADMIN");
        } else if (Boolean.TRUE.equals(user.getIsDriver())) {
            dto.setRole("DRIVER");
        } else {
            dto.setRole("USER");
        }

        dto.setIsDriver(user.getIsDriver());

        dto.setLat(user.getLat());
        dto.setLon(user.getLon());

        dto.setPfp(user.getPfp());
        dto.setCreatedAt(user.getCreatedAt());

        dto.setDistance(user.getDistance());
        dto.setCo2(user.getCo2());

        return dto;
    }

    // ============================
    // UPDATE DTO -> EXISTING ENTITY
    // ============================
    public void updateEntityFromDTO(UserUpdateDTO dto, User user) {

        if (dto.getDisplayName() != null) {
            user.setDisplayName(dto.getDisplayName());
        }

        if (dto.getPfp() != null) {
            user.setPfp(dto.getPfp());
        }

        if (dto.getDriver() != null) {
            user.setIsDriver(dto.getDriver());
        }

        if (dto.getLat() != null) {
            user.setLat(dto.getLat());
        }

        if (dto.getLon() != null) {
            user.setLon(dto.getLon());
        }

        user.setUpdatedAt(LocalDateTime.now());
    }
}
