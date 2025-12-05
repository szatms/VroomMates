package com.vroommates.VroomMates.model.usermodel.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UserResponseDTO {

    private Integer userId;
    private String userName;
    private String displayName;
    private String email;
    private String role;
    private Boolean isDriver;
    private Double lat;
    private Double lon;
    private String pfp;
    private LocalDateTime createdAt;
    private Integer distance;
    private Integer co2;
}