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

    private double startLat;
    private double startLon;

    private LocalDateTime departureTime;

    private double endLat;
    private double endLon;

    private int totalSeats;
    private int passengerCount;
    private int remainingSeats;

    private double distance;
    private double co2;

    private String tripMessage;
    
    private String startLocation;
    private String endLocation;
}
