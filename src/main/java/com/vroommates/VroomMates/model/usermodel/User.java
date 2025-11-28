package com.vroommates.VroomMates.model.usermodel;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue
    private int userID;
    private String role;

    private double lat;
    private double lon;

    private String userName;
    private String passwordHash;
    private LocalDateTime createdAt;
    private String displayName;
    private String email;
    private String PFP;
}
