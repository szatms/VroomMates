package com.vroommates.VroomMates.model.usermodel.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserCreateDTO {
    @NotBlank(message = "A username must be selected.")
    private String userName;

    @NotBlank(message = "A display name must be selected.")
    private String displayName;

    @Email(message = "The format of this email address is incorrect.")
    @NotBlank(message = "An email address must be given.")
    private String email;

    @NotBlank(message = "A password must be given.")
    @Size(min = 6, message = "Password must be at least 6 characters long.")
    private String password;

    private boolean driver;
}
