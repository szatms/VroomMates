package com.vroommates.VroomMates.model.tripmodel.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TripRequestDTO {
    private int driverID;
    //private String vehiclePlate;
    private Boolean isLive;

    private LocalDateTime departureTime;

    private double startLat;
    private double startLon;

    private double endLat;
    private double endLon;

    private String tripMessage;
}
