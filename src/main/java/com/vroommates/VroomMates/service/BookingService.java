package com.vroommates.VroomMates.service;

import com.vroommates.VroomMates.model.bookingmodel.Booking;
import com.vroommates.VroomMates.model.bookingmodel.BookingRepository;
import com.vroommates.VroomMates.model.bookingmodel.BookingStatus;
import com.vroommates.VroomMates.model.bookingmodel.dto.BookingRequestDTO;
import com.vroommates.VroomMates.model.bookingmodel.dto.BookingResponseDTO;
import com.vroommates.VroomMates.model.bookingmodel.dto.PassengerResponseDTO;
import com.vroommates.VroomMates.model.bookingmodel.mapper.BookingMapper;
import com.vroommates.VroomMates.model.ratingmodel.RatingRepository;
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
    private final RatingRepository ratingRepository;
    private final BookingMapper bookingMapper;

    public BookingResponseDTO joinTrip(BookingRequestDTO dto) {
        Trip trip = tripRepository.findById(dto.getTripID())
                .orElseThrow(() -> new RuntimeException("Trip not found"));

        if (trip.getDepartureTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Ez az út már elindult, nem lehet jelentkezni!");
        }

        User user = userRepository.findById(dto.getUserID())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (trip.getDriver().equals(user)) {
            throw new RuntimeException("Driver cannot join their own trip.");
        }

        bookingRepository.findByTripAndUser(trip, user)
                .ifPresent(existing -> {
                    if (existing.getStatus() == BookingStatus.JOINED || existing.getStatus() == BookingStatus.PENDING) {
                        throw new RuntimeException("Már jelentkeztél erre az útra!");
                    }
                });

        int totalSeats = trip.getVehicle().getSeats();
        int maxPassengerSeats = totalSeats - 1;
        int activePassengers = bookingRepository.countByTripAndStatus(trip, BookingStatus.JOINED);

        if (activePassengers >= maxPassengerSeats) {
            throw new RuntimeException("Trip is full.");
        }

        Booking booking = Booking.builder()
                .trip(trip)
                .user(user)
                .status(BookingStatus.PENDING)
                .joinedAt(LocalDateTime.now())
                .build();

        bookingRepository.save(booking);
        return bookingMapper.toDTO(booking);
    }

    public BookingResponseDTO leaveTrip(BookingRequestDTO dto) {
        Trip trip = tripRepository.findById(dto.getTripID()).orElseThrow(() -> new RuntimeException("Trip not found"));
        User user = userRepository.findById(dto.getUserID()).orElseThrow(() -> new RuntimeException("User not found"));
        Booking booking = bookingRepository.findByTripAndUser(trip, user).orElseThrow(() -> new RuntimeException("Booking not found."));
        booking.setStatus(BookingStatus.CANCELLED);
        booking.setLeftAt(LocalDateTime.now());
        bookingRepository.save(booking);
        return bookingMapper.toDTO(booking);
    }

    public BookingResponseDTO acceptBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId).orElseThrow(() -> new RuntimeException("Booking not found"));
        validateDriver(booking.getTrip());
        int totalSeats = booking.getTrip().getVehicle().getSeats();
        int active = bookingRepository.countByTripAndStatus(booking.getTrip(), BookingStatus.JOINED);
        if (active >= (totalSeats - 1)) throw new RuntimeException("Trip is full.");
        booking.setStatus(BookingStatus.JOINED);
        bookingRepository.save(booking);
        return bookingMapper.toDTO(booking);
    }

    public BookingResponseDTO rejectBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId).orElseThrow(() -> new RuntimeException("Booking not found"));
        validateDriver(booking.getTrip());
        booking.setStatus(BookingStatus.REJECTED);
        bookingRepository.save(booking);
        return bookingMapper.toDTO(booking);
    }

    private void validateDriver(Trip trip) {
        String currentEmail = Objects.requireNonNull(SecurityContextHolder.getContext().getAuthentication()).getName();
        if (!trip.getDriver().getEmail().equals(currentEmail)) throw new RuntimeException("Unauthorized.");
    }

    public List<PassengerResponseDTO> getPassengersForTrip(int tripID) {
        Trip trip = tripRepository.findById(tripID).orElseThrow(() -> new RuntimeException("Trip not found"));
        List<Booking> bookings = bookingRepository.findAllByTrip(trip);
        return bookings.stream().map(booking -> {
            Double avgRating = ratingRepository.getAverageRating(booking.getUser(), false);
            int completedTrips = bookingRepository.findByUserAndStatus(booking.getUser(), BookingStatus.JOINED).size();
            return PassengerResponseDTO.builder()
                    .userID(booking.getUser().getUserId())
                    .name(booking.getUser().getDisplayName() != null ? booking.getUser().getDisplayName() : booking.getUser().getUserName())
                    .email(booking.getUser().getEmail())
                    .status(booking.getStatus())
                    .bookingID(booking.getBookingID())
                    .pfp(booking.getUser().getPfp())
                    .rating(avgRating)
                    .completedTrips(completedTrips)
                    .build();
        }).toList();
    }

    public List<BookingResponseDTO> getBookingsByUser(int userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return bookingRepository.findAll().stream()
                .filter(b -> b.getUser().equals(user))
                .map(bookingMapper::toDTO)
                .toList();
    }
}