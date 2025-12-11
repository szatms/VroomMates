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
import org.springframework.security.core.context.SecurityContextHolder;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final BookingMapper bookingMapper;

    // =======================================================================
    // JOIN TRIP
    // =======================================================================

    public BookingResponseDTO joinTrip(BookingRequestDTO dto) {

        Trip trip = tripRepository.findById(dto.getTripID())
                .orElseThrow(() -> new RuntimeException("Trip not found"));

        User user = userRepository.findById(dto.getUserID())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 1) Driver nem lehet utas
        if (trip.getDriver().equals(user)) {
            throw new RuntimeException("Driver cannot join their own trip.");
        }

        // 2) Van-e már foglalása?
        bookingRepository.findByTripAndUser(trip, user)
                .ifPresent(existing -> {
                    if (existing.getStatus() == BookingStatus.JOINED) {
                        throw new RuntimeException("User already joined the trip.");
                    }
                });

        // 3) Kapacitás ellenőrzés (ÖSSZES ülés logika)
        int totalSeats = trip.getVehicle().getSeats(); // pl. 7
        int maxPassengerSeats = totalSeats - 1;        // sofőr hely levonva

        int activePassengers = bookingRepository.countByTripAndStatus(trip, BookingStatus.JOINED);

        if (activePassengers >= maxPassengerSeats) {
            throw new RuntimeException("Trip is full.");
        }

        // 4) Foglalás mentése
        Booking booking = Booking.builder()
                .trip(trip)
                .user(user)
                .status(BookingStatus.PENDING)
                .joinedAt(LocalDateTime.now())
                .build();

        bookingRepository.save(booking);

        return bookingMapper.toDTO(booking);
    }

    // =======================================================================
    // LEAVE TRIP
    // =======================================================================

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

    public BookingResponseDTO acceptBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        validateDriver(booking.getTrip());

        int totalSeats = booking.getTrip().getVehicle().getSeats();
        int active = bookingRepository.countByTripAndStatus(booking.getTrip(), BookingStatus.JOINED);

        if (active >= totalSeats) {
            throw new RuntimeException("Trip is full, cannot accept more passengers.");
        }

        booking.setStatus(BookingStatus.JOINED);
        bookingRepository.save(booking);

        return bookingMapper.toDTO(booking);
    }

    public BookingResponseDTO rejectBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        validateDriver(booking.getTrip());

        booking.setStatus(BookingStatus.REJECTED);
        bookingRepository.save(booking);

        return bookingMapper.toDTO(booking);
    }

    private void validateDriver(Trip trip) {
        String currentEmail = Objects.requireNonNull(SecurityContextHolder.getContext().getAuthentication()).getName();
        if (!trip.getDriver().getEmail().equals(currentEmail)) {
            throw new RuntimeException("Only the driver can manage bookings for this trip.");
        }
    }
    // =======================================================================
    // PASSENGER LIST
    // =======================================================================

    public List<PassengerResponseDTO> getPassengersForTrip(int tripID) {

        Trip trip = tripRepository.findById(tripID)
                .orElseThrow(() -> new RuntimeException("Trip not found"));

        List<Booking> bookings =
                bookingRepository.findByTripAndStatus(trip, BookingStatus.JOINED);

        return bookings.stream()
                .map(booking -> PassengerResponseDTO.builder()
                        .userID(booking.getUser().getUserId())
                        .name(booking.getUser().getUserName())
                        .email(booking.getUser().getEmail())
                        .bookingID(booking.getBookingID())
                        .pfp(booking.getUser().getPfp())
                        .build())
                .toList();
    }

    public List<PassengerResponseDTO> getApplicantsForTrip(int tripID) {
        Trip trip = tripRepository.findById(tripID)
                .orElseThrow(() -> new RuntimeException("Trip not found"));

        List<Booking> bookings = bookingRepository.findAllByTrip(trip);

        return bookings.stream()
                .map(booking -> PassengerResponseDTO.builder()
                        .userID(booking.getUser().getUserId())
                        .name(booking.getUser().getDisplayName() != null ? booking.getUser().getDisplayName() : booking.getUser().getUserName())
                        .email(booking.getUser().getEmail())
                        .status(booking.getStatus())
                        .build())
                .toList();
    }

}
