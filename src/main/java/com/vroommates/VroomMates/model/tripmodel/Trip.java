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
    private float startLat;
    private float startLon;

    //end coordinates
    private float endLat;
    private float endLon;
}
