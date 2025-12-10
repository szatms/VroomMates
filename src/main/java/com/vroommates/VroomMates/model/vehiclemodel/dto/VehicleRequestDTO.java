package com.vroommates.VroomMates.model.vehiclemodel.dto;

import lombok.Data;

@Data
public class VehicleRequestDTO {
    private String plate;
    private int ownerID;
    private int seats;
    private String make;
    private String model;
    private int year;
    private String colour;
    private String fuel;
    private String picture;
}