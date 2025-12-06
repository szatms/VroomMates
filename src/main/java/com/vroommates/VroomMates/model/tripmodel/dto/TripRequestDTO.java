package com.vroommates.VroomMates.model.tripmodel.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TripRequestDTO {
    private int driverID;
    private String vehiclePlate;
    private boolean isLive;

    private LocalDateTime departureTime;

    private float startLat;
    private float startLon;

    private float endLat;
    private float endLon;
}