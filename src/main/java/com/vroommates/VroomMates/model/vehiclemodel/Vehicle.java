package com.vroommates.VroomMates.model.vehiclemodel;

import jakarta.persistence.Entity;
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
public class Vehicle {
    @Id
    private String plate; //NEM self-generated value, minden user maga adja meg
    private int ownerID;

    private int seats;
    private int make;
    private int model;
    private int year;
    private String colour;
    private String fuel;
    private String picture;
}
