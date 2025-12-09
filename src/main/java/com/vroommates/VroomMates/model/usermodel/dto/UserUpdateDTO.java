package com.vroommates.VroomMates.model.usermodel.dto;

import lombok.Data;

@Data
public class UserUpdateDTO {
    private String displayName;
    private String pfp;
    private Boolean driver;
    private Double lat;
    private Double lon;
}
