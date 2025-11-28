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
    private String Plate; //NEM self-generated value, minden user maga adja meg
    private int OwnerID;

    private int Seats;
    private int Make;
    private int Model;
    private int year;
    private String Colour;
    private String Fuel;
    private String picture;
}
