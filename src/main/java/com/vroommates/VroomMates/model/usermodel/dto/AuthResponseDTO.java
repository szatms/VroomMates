package com.vroommates.VroomMates.model.usermodel.dto;

import lombok.Data;

@Data
public class AuthResponseDTO {
    private UserResponseDTO user;
    private String accessToken;
}
