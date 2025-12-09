package com.vroommates.VroomMates.model.tripmodel;

import com.vroommates.VroomMates.model.usermodel.User;
import com.vroommates.VroomMates.model.vehiclemodel.Vehicle;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Trip {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int tripID;

    @ManyToOne
    private User driver;
    private boolean isLive;

    @ManyToOne
    @JoinColumn(name = "vehicle_plate")
    private Vehicle vehicle;

    private LocalDateTime departureTime;

    //start coordinates
    private double startLat;
    private double startLon;

    //end coordinates
    private double endLat;
    private double endLon;

    private String tripMessage;
}
