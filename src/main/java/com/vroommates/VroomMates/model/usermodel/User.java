package com.vroommates.VroomMates.model.usermodel;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@ToString
@EqualsAndHashCode(callSuper = false) // Csak ha van öröklés
@NoArgsConstructor // A JPA-nak kell
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer userId;

    private Boolean isAdmin;
    private Boolean isDriver;
    private Boolean enabled;

    private Float lat;
    private Float lon;

    @Column(name = "username")
    private String userName;

    @Column(name = "password")
    private String passwordHash;

    @Column(name = "createdat")
    private LocalDateTime createdAt;

    @Column(name = "updatedat")
    private LocalDateTime updatedAt;

    @Column(name = "displayname")
    private String displayName;

    @Column(unique = true)
    private String email;

    @Column(name = "profilp")
    private String pfp;

    @Column(name = "distance")
    private Integer distance = 0;
    @Column(name = "co2")
    private Integer co2 = 0;


}
