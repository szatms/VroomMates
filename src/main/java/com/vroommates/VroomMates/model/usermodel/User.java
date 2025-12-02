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
    @Getter(AccessLevel.NONE) // ÚJ: Kizárja a Lombok automatikus generálását
    @Setter(AccessLevel.NONE) // ÚJ: Kizárja a Lombok automatikus generálását
    private Integer userId; //

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
    private String PFP;


    public Integer getUserId() {
        System.out.println("--- GETTER FUTÁS --- | userId érték: " + this.userId);
        return this.userId;
    }

    public void setUserId(Integer userId) {
        System.out.println("--- SETTER FUTÁS --- | Kapott userId érték: " + userId);
        this.userId = userId;
    }

}
