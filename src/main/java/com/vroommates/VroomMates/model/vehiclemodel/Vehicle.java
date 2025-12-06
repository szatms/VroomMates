package com.vroommates.VroomMates.model.vehiclemodel;

import com.vroommates.VroomMates.model.usermodel.User;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
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

    @ManyToOne
    @JoinColumn(name = "owner_id")   // ezt az oszlopot fogja létrehozni
    private User owner;

    private int seats;
    private int make;
    private String model;
    private int year;
    private String colour;
    private String fuel;
    private String picture;
}
