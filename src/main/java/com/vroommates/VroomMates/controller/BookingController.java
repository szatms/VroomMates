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

    @PostMapping("/{bookingId}/accept")
    public BookingResponseDTO acceptBooking(@PathVariable Long bookingId) {
        return bookingService.acceptBooking(bookingId);
    }

    // Sofőr elutasítja
    @PostMapping("/{bookingId}/reject")
    public BookingResponseDTO rejectBooking(@PathVariable Long bookingId) {
        return bookingService.rejectBooking(bookingId);
    }
    @GetMapping("/passengers/{tripId}")
    public List<PassengerResponseDTO> getPassengers(@PathVariable int tripId) {
        return bookingService.getPassengersForTrip(tripId);
    }

}
