package com.vroommates.VroomMates.model.bookingmodel.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PassengerResponseDTO {
    private int userID;
    private String name;
    private String email;
}
