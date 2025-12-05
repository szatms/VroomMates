package com.vroommates.VroomMates.model.tripmodel.dto;

import lombok.Data;

@Data
public class TripRequestDTO {
    private int driverID;
    private boolean isLive;

    private float startLat;
    private float startLon;

    private float endLat;
    private float endLon;
}