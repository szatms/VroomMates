package com.vroommates.VroomMates.model.tripmodel.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TripResponseDTO {
    private int tripID;
    private int driverID;
    private boolean isLive;

    private float startLat;
    private float startLon;

    private float endLat;
    private float endLon;
}