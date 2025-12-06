package com.vroommates.VroomMates.controller;

import com.vroommates.VroomMates.model.bookingmodel.dto.BookingRequestDTO;
import com.vroommates.VroomMates.model.bookingmodel.dto.BookingResponseDTO;
import com.vroommates.VroomMates.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping("/join")
    public BookingResponseDTO joinTrip(@RequestBody BookingRequestDTO dto) {
        return bookingService.joinTrip(dto);
    }

    @PostMapping("/leave")
    public BookingResponseDTO leaveTrip(@RequestBody BookingRequestDTO dto) {
        return bookingService.leaveTrip(dto);
    }
}
