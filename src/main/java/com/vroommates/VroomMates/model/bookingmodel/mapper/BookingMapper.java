package com.vroommates.VroomMates.model.bookingmodel.mapper;

import com.vroommates.VroomMates.model.bookingmodel.Booking;
import com.vroommates.VroomMates.model.bookingmodel.dto.BookingResponseDTO;
import org.springframework.stereotype.Component;

@Component
public class BookingMapper {

    public BookingResponseDTO toDTO(Booking entity) {
        return BookingResponseDTO.builder()
                .bookingID(entity.getBookingID())
                .tripID(entity.getTrip().getTripID())
                .userID(entity.getUser().getUserId())
                .status(entity.getStatus())
                .joinedAt(entity.getJoinedAt())
                .leftAt(entity.getLeftAt())
                .build();
    }
}
