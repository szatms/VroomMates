package com.vroommates.VroomMates.model.bookingmodel.dto;

import com.vroommates.VroomMates.model.bookingmodel.BookingStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class BookingResponseDTO {
    private Long bookingID;
    private int tripID;
    private int userID;
    private BookingStatus status;
    private LocalDateTime joinedAt;
    private LocalDateTime leftAt;
}
