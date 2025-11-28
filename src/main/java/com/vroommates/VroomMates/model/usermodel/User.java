package com.vroommates.VroomMates.model.usermodel;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue
    private Long UserID;
    private boolean IsDriver;

    private int Lat;
    private int Lon;

    private String UserName;
    private String Password;
    private String PersonalDate;
    private String DisplayName;
    private String Email;
    private String PFP;
}
