package com.vroommates.VroomMates.service;

import com.vroommates.VroomMates.model.bookingmodel.Booking;
import com.vroommates.VroomMates.model.bookingmodel.BookingRepository;
import com.vroommates.VroomMates.model.bookingmodel.BookingStatus;
import com.vroommates.VroomMates.model.bookingmodel.dto.PassengerResponseDTO;
import com.vroommates.VroomMates.model.ratingmodel.RatingRepository;
import com.vroommates.VroomMates.model.tripmodel.Trip;
import com.vroommates.VroomMates.model.tripmodel.TripRepository;
import com.vroommates.VroomMates.model.tripmodel.dto.TripRequestDTO;
import com.vroommates.VroomMates.model.tripmodel.dto.TripResponseDTO;
import com.vroommates.VroomMates.model.tripmodel.mapper.TripMapper;
import com.vroommates.VroomMates.model.usermodel.User;
import com.vroommates.VroomMates.model.usermodel.UserRepository;
import com.vroommates.VroomMates.model.vehiclemodel.Vehicle;
import com.vroommates.VroomMates.model.vehiclemodel.VehicleRepository;
import com.vroommates.VroomMates.util.DistanceCalculator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class TripService {

    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;
    private final BookingRepository bookingRepository;
    private final RatingRepository ratingRepository;
    private final TripMapper tripMapper;

    private TripResponseDTO toTripDTOWithPassengers(Trip trip) {

        int totalSeats = trip.getVehicle().getSeats();

        List<Booking> activeBookings = bookingRepository.findByTripAndStatus(trip, BookingStatus.JOINED);

        int activePassengers = activeBookings.size();
        int passengerCount = activePassengers + 1;
        int remainingSeats = totalSeats - passengerCount;

        List<PassengerResponseDTO> passengerDTOs = activeBookings.stream()
                .map(b -> PassengerResponseDTO.builder()
                        .userID(b.getUser().getUserId())
                        .name(b.getUser().getDisplayName() != null ? b.getUser().getDisplayName() : b.getUser().getUserName())
                        .pfp(b.getUser().getPfp())
                        .status(b.getStatus())
                        .build())
                .toList();

        TripResponseDTO dto = tripMapper.toDTO(trip);

        dto.setDriverName(trip.getDriver().getDisplayName() != null ? trip.getDriver().getDisplayName() : trip.getDriver().getUserName());
        dto.setDriverPfp(trip.getDriver().getPfp());

        Double rating = ratingRepository.getAverageRating(trip.getDriver(), true);
        dto.setDriverRating(rating);

        dto.setVehicleMake(trip.getVehicle().getMake());
        dto.setVehicleModel(trip.getVehicle().getModel());
        dto.setVehiclePicture(trip.getVehicle().getPicture());

        dto.setPassengers(passengerDTOs);
        dto.setTotalSeats(totalSeats);
        dto.setPassengerCount(passengerCount);
        dto.setRemainingSeats(remainingSeats);

        dto.setStartLocation(trip.getStartLocation());
        dto.setEndLocation(trip.getEndLocation());

        if (!trip.isLive() && dto.getDistance() == 0) {
            double dist = DistanceCalculator.haversine(trip.getStartLat(), trip.getStartLon(), trip.getEndLat(), trip.getEndLon());
            dto.setDistance(dist);
            dto.setCo2(dist * 0.12);
        }

        return dto;
    }

    public TripResponseDTO createTrip(TripRequestDTO dto) {
        User driver = userRepository.findById(dto.getDriverID())
                .orElseThrow(() -> new RuntimeException("Driver not found"));

        Vehicle vehicle = vehicleRepository.findFirstByOwner(driver)
                .orElseThrow(() -> new RuntimeException("Driver has no registered vehicle"));

        Trip trip = tripMapper.toEntity(dto);
        trip.setDriver(driver);
        trip.setVehicle(vehicle);
        trip.setStartLocation(dto.getStartLocation());
        trip.setEndLocation(dto.getEndLocation());

        Trip saved = tripRepository.save(trip);
        return toTripDTOWithPassengers(saved);
    }

    public TripResponseDTO getTripById(int id) {
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Trip not found"));
        return toTripDTOWithPassengers(trip);
    }

    public List<TripResponseDTO> getAllTrips() {
        return tripRepository.findAll()
                .stream()
                .map(this::toTripDTOWithPassengers)
                .toList();
    }

    public TripResponseDTO updateTrip(int id, TripRequestDTO dto) {
        Trip existing = tripRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Trip not found"));
        User driver = userRepository.findById(dto.getDriverID())
                .orElseThrow(() -> new RuntimeException("Driver not found"));
        Vehicle vehicle = vehicleRepository.findFirstByOwner(driver)
                .orElseThrow(() -> new RuntimeException("Driver has no registered vehicle"));

        existing.setDriver(driver);
        existing.setVehicle(vehicle);
        if (dto.getIsLive() != null) existing.setLive(dto.getIsLive());
        existing.setDepartureTime(dto.getDepartureTime());
        existing.setStartLat(dto.getStartLat());
        existing.setStartLon(dto.getStartLon());
        existing.setEndLat(dto.getEndLat());
        existing.setEndLon(dto.getEndLon());
        existing.setTripMessage(dto.getTripMessage());

        Trip updated = tripRepository.save(existing);
        return toTripDTOWithPassengers(updated);
    }

    public void deleteTrip(int id) { tripRepository.deleteById(id); }

    public List<TripResponseDTO> searchTrips(double startLat, double startLon, double endLat, double endLon) {
        double delta = 0.1;
        List<Trip> raw = tripRepository.searchByBoundingBox(
                startLat - delta, startLat + delta,
                startLon - delta, startLon + delta,
                endLat - delta, endLat + delta,
                endLon - delta, endLon + delta
        );
        return raw.stream()
                .filter(t -> {
                    double startDist = DistanceCalculator.haversine(startLat, startLon, t.getStartLat(), t.getStartLon());
                    double endDist = DistanceCalculator.haversine(endLat, endLon, t.getEndLat(), t.getEndLon());
                    return startDist <= 10 && endDist <= 10;
                })
                .map(this::toTripDTOWithPassengers)
                .toList();
    }

    public TripResponseDTO endTrip(int tripId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found"));
        if (!trip.isLive()) throw new RuntimeException("Trip already ended");

        double distanceKm = DistanceCalculator.calculateDistance(trip.getStartLat(), trip.getStartLon(), trip.getEndLat(), trip.getEndLon());
        double co2 = distanceKm * 0.12;

        trip.setLive(false);
        tripRepository.save(trip);

        User driver = trip.getDriver();
        driver.setDistance(driver.getDistance() + distanceKm);
        driver.setCo2(driver.getCo2() + co2);
        userRepository.save(driver);

        var passengers = bookingRepository.findByTripAndStatus(trip, BookingStatus.JOINED);
        passengers.forEach(booking -> {
            User passenger = booking.getUser();
            passenger.setDistance(passenger.getDistance() + distanceKm);
            passenger.setCo2(passenger.getCo2() + co2);
            userRepository.save(passenger);
        });

        TripResponseDTO dto = toTripDTOWithPassengers(trip);
        dto.setDistance(distanceKm);
        dto.setCo2(co2);
        return dto;
    }

    public List<TripResponseDTO> getActiveTripsForDriver(int driverId) {
        User driver = userRepository.findById(driverId)
                .orElseThrow(() -> new RuntimeException("Driver not found"));
        return tripRepository.findAllByDriverAndIsLiveTrueOrderByDepartureTimeAsc(driver)
                .stream()
                .map(this::toTripDTOWithPassengers)
                .toList();
    }

    public List<TripResponseDTO> getTripsForUser(int userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<Trip> driverTrips = tripRepository.findAll().stream().filter(t -> t.getDriver().equals(user)).toList();
        List<Booking> passengerBookings = bookingRepository.findByUserAndStatus(user, BookingStatus.JOINED);
        List<Trip> passengerTrips = passengerBookings.stream().map(Booking::getTrip).toList();

        return Stream.concat(driverTrips.stream(), passengerTrips.stream())
                .distinct()
                .sorted(Comparator.comparing(Trip::getDepartureTime).reversed())
                .map(this::toTripDTOWithPassengers)
                .toList();
    }
}