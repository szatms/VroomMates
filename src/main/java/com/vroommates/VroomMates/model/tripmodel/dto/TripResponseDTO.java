package com.vroommates.VroomMates.model.tripmodel.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class TripResponseDTO {
    private int tripID;
    private int driverID;
    private String vehiclePlate;
    private boolean isLive;

    private float startLat;
    private float startLon;

    private LocalDateTime departureTime;

    private float endLat;
    private float endLon;
}