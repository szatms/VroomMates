package com.vroommates.VroomMates.model.bookingmodel.dto;

import com.vroommates.VroomMates.model.bookingmodel.BookingStatus;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PassengerResponseDTO {
    private int userID;
    private String name;
    private String email;
    private BookingStatus status;
}