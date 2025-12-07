package com.vroommates.VroomMates.model.usermodel.mapper;

import com.vroommates.VroomMates.model.usermodel.User;
import com.vroommates.VroomMates.model.usermodel.dto.UserCreateDTO;
import com.vroommates.VroomMates.model.usermodel.dto.UserUpdateDTO;
import com.vroommates.VroomMates.model.usermodel.dto.UserResponseDTO;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class UserMapper {

    // CREATE DTO -> ENTITY
    public User fromCreateDTO(UserCreateDTO dto, String passwordHash) {
        return User.builder()
                .userId(null)                    // JPA generálja
                .isAdmin(false)                  // új user ne legyen admin
                .isDriver(dto.isDriver())        // boolean -> Boolean autobox
                .enabled(true)
                .lat(0f)
                .lon(0f)
                .userName(dto.getUserName())
                .passwordHash(passwordHash)
                .displayName(dto.getDisplayName())
                .email(dto.getEmail())
                .pfp(null)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    // ENTITY -> RESPONSE DTO
    public UserResponseDTO toResponseDTO(User user) {
        UserResponseDTO dto = new UserResponseDTO();

        dto.setUserId(user.getUserId());
        dto.setUserName(user.getUserName());
        dto.setDisplayName(user.getDisplayName());
        dto.setEmail(user.getEmail());

        // egyszerű role-logika
        if (Boolean.TRUE.equals(user.getIsAdmin())) {
            dto.setRole("ADMIN");
        } else if (Boolean.TRUE.equals(user.getIsDriver())) {
            dto.setRole("DRIVER");
        } else {
            dto.setRole("USER");
        }

        dto.setIsDriver(user.getIsDriver());

        // Float -> Double
        dto.setLat(user.getLat() != null ? user.getLat().doubleValue() : null);
        dto.setLon(user.getLon() != null ? user.getLon().doubleValue() : null);

        dto.setPfp(user.getPfp());
        dto.setCreatedAt(user.getCreatedAt());

        dto.setDistance(user.getDistance() != null ? user.getDistance() : 0);
        dto.setCo2(user.getCo2() != null ? user.getCo2() : 0);

        return dto;
    }


    // UPDATE DTO -> meglévő ENTITY módosítása
    public void updateEntityFromDTO(UserUpdateDTO dto, User user) {

        if (dto.getDisplayName() != null) {
            user.setDisplayName(dto.getDisplayName());
        }

        if (dto.getPfp() != null) {
            user.setPfp(dto.getPfp());
        }

        // boolean -> Boolean
        user.setIsDriver(dto.getDriver());

        user.setLat((float) dto.getLat());
        user.setLon((float) dto.getLon());

        user.setUpdatedAt(LocalDateTime.now());
    }
}
