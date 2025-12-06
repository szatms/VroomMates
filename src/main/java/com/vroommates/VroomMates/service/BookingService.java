package com.vroommates.VroomMates.service;

import com.vroommates.VroomMates.model.bookingmodel.Booking;
import com.vroommates.VroomMates.model.bookingmodel.BookingRepository;
import com.vroommates.VroomMates.model.bookingmodel.BookingStatus;
import com.vroommates.VroomMates.model.bookingmodel.dto.BookingRequestDTO;
import com.vroommates.VroomMates.model.bookingmodel.dto.BookingResponseDTO;
import com.vroommates.VroomMates.model.bookingmodel.dto.PassengerResponseDTO;
import com.vroommates.VroomMates.model.bookingmodel.mapper.BookingMapper;
import com.vroommates.VroomMates.model.tripmodel.Trip;
import com.vroommates.VroomMates.model.tripmodel.TripRepository;
import com.vroommates.VroomMates.model.usermodel.User;
import com.vroommates.VroomMates.model.usermodel.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final BookingMapper bookingMapper;

    public BookingResponseDTO joinTrip(BookingRequestDTO dto) {

        Trip trip = tripRepository.findById(dto.getTripID())
                .orElseThrow(() -> new RuntimeException("Trip not found"));

        User user = userRepository.findById(dto.getUserID())
                .orElseThrow(() -> new RuntimeException("User not found"));


        // 1) User nem lehet a driver
        if (trip.getDriver().equals(user)) {
            throw new RuntimeException("Driver cannot join their own trip.");
        }

        // 2) Nincs-e már foglalása?
        bookingRepository.findByTripAndUser(trip, user)
                .ifPresent(b -> {
                    if (b.getStatus() == BookingStatus.JOINED) {
                        throw new RuntimeException("User already joined the trip.");
                    }
                });

        // 3) Kapacitás check
        int totalSeats = trip.getVehicle().getSeats();
        int active = bookingRepository.countByTripAndStatus(trip, BookingStatus.JOINED);

        if (active >= totalSeats) {
            throw new RuntimeException("Trip is full.");
        }

        // 4) Létrehozás
        Booking booking = Booking.builder()
                .trip(trip)
                .user(user)
                .status(BookingStatus.JOINED)
                .joinedAt(LocalDateTime.now())
                .build();

        bookingRepository.save(booking);

        return bookingMapper.toDTO(booking);
    }


    public BookingResponseDTO leaveTrip(BookingRequestDTO dto) {

        Trip trip = tripRepository.findById(dto.getTripID())
                .orElseThrow(() -> new RuntimeException("Trip not found"));

        User user = userRepository.findById(dto.getUserID())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Booking booking = bookingRepository.findByTripAndUser(trip, user)
                .orElseThrow(() -> new RuntimeException("Booking not found."));

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setLeftAt(LocalDateTime.now());

        bookingRepository.save(booking);

        return bookingMapper.toDTO(booking);
    }

    public List<PassengerResponseDTO> getPassengersForTrip(int tripID) {

        Trip trip = tripRepository.findById(tripID)
                .orElseThrow(() -> new RuntimeException("Trip not found"));

        List<Booking> bookings = bookingRepository.findByTripAndStatus(trip, BookingStatus.JOINED);

        return bookings.stream()
                .map(booking -> PassengerResponseDTO.builder()
                        .userID(booking.getUser().getUserId())
                        .name(booking.getUser().getUserName())
                        .email(booking.getUser().getEmail())
                        .build())
                .toList();
    }

}
