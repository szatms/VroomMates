package com.vroommates.VroomMates.model.usermodel;

import jakarta.persistence.Column;
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
    private int userId;
    private String role;
    private boolean isDriver;
    private boolean enabled;

    private double lat;
    private double lon;

    private String userName;
    private String passwordHash; //majd bcrypt-el meg kell oldani
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String displayName;
    @Column(unique = true)
    private String email;
    private String PFP;
}
