package com.vroommates.VroomMates.model.tripmodel;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Trip {
    @Id
    @GeneratedValue
    private int tripID;
    private int driverID;
    private boolean isLive;

    //start coordinates
    private double startLat;
    private double startLon;

    //end coordinates
    private double endLat;
    private double endLon;
}
