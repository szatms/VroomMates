package com.vroommates.VroomMates.model.tripmodel.dto;

import com.vroommates.VroomMates.model.bookingmodel.dto.PassengerResponseDTO;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class TripResponseDTO {
    private int tripID;
    private int driverID;
    private String driverName;
    private String driverPfp;

    private Double driverRating;

    private String vehiclePlate;
    private String vehicleMake;
    private String vehicleModel;

    private String vehiclePicture;

    private boolean isLive;

    private LocalDateTime departureTime;

    private double startLat;
    private double startLon;

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

    private List<PassengerResponseDTO> passengers;
}