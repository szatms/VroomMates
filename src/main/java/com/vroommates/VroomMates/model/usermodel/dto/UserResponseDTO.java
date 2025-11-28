package com.vroommates.VroomMates.model.usermodel.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UserResponseDTO {

    private int userId;
    private String userName;
    private String displayName;
    private String email;
    private String role;
    private boolean isDriver;
    private double lat;
    private double lon;
    private String pfp;
    private LocalDateTime createdAt;
}
