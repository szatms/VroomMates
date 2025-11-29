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
    private int TripID;
    private int DriverID;
    private boolean IsLive;

    //start coordinates
    private long StartLat;
    private long StartLon;

    //end coordinates
    private long EndLat;
    private long EndLon;
}
