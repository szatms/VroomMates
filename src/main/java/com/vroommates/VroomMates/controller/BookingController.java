package com.vroommates.VroomMates.controller;

import com.vroommates.VroomMates.model.bookingmodel.dto.BookingRequestDTO;
import com.vroommates.VroomMates.model.bookingmodel.dto.BookingResponseDTO;
import com.vroommates.VroomMates.model.bookingmodel.dto.PassengerResponseDTO;
import com.vroommates.VroomMates.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    @GetMapping("/passengers/{tripId}")
    public List<PassengerResponseDTO> getPassengers(@PathVariable int tripId) {
        return bookingService.getPassengersForTrip(tripId);
    }

}
