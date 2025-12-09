package com.vroommates.VroomMates.service;

import com.vroommates.VroomMates.model.bookingmodel.BookingRepository;
import com.vroommates.VroomMates.model.bookingmodel.BookingStatus;
import com.vroommates.VroomMates.model.tripmodel.Trip;
import com.vroommates.VroomMates.model.tripmodel.TripRepository;
import com.vroommates.VroomMates.model.tripmodel.dto.TripRequestDTO;
import com.vroommates.VroomMates.model.tripmodel.dto.TripResponseDTO;
import com.vroommates.VroomMates.model.tripmodel.mapper.TripMapper;
import com.vroommates.VroomMates.model.usermodel.User;
import com.vroommates.VroomMates.model.usermodel.UserRepository;
import com.vroommates.VroomMates.model.vehiclemodel.Vehicle;
import com.vroommates.VroomMates.model.vehiclemodel.VehicleRepository;
import com.vroommates.VroomMates.model.bookingmodel.BookingRepository;
import com.vroommates.VroomMates.util.DistanceCalculator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TripService {

    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;
    private final BookingRepository bookingRepository;
    private final TripMapper tripMapper;

    private TripResponseDTO toTripDTOWithPassengers(Trip trip) {

        int totalSeats = trip.getVehicle().getSeats();
        int activePassengers = bookingRepository.countByTripAndStatus(trip, BookingStatus.JOINED);
        int passengerCount = activePassengers + 1; // sofőr is számít
        int remainingSeats = totalSeats - passengerCount;

        TripResponseDTO dto = tripMapper.toDTO(trip);
        dto.setTotalSeats(totalSeats);
        dto.setPassengerCount(passengerCount);
        dto.setRemainingSeats(remainingSeats);
        return dto;
    }

    public TripResponseDTO createTrip(TripRequestDTO dto) {

        User driver = userRepository.findById(dto.getDriverID())
                .orElseThrow(() -> new RuntimeException("Driver not found"));

        Vehicle vehicle = vehicleRepository.findById(dto.getVehiclePlate())
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        Trip trip = tripMapper.toEntity(dto);
        trip.setDriver(driver);
        trip.setVehicle(vehicle);

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

        Vehicle vehicle = vehicleRepository.findById(dto.getVehiclePlate())
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        existing.setDriver(driver);
        existing.setVehicle(vehicle);
        existing.setLive(dto.isLive());
        existing.setDepartureTime(dto.getDepartureTime());
        existing.setStartLat(dto.getStartLat());
        existing.setStartLon(dto.getStartLon());
        existing.setEndLat(dto.getEndLat());
        existing.setEndLon(dto.getEndLon());
        existing.setTripMessage(dto.getTripMessage()); // ÚJ

        Trip updated = tripRepository.save(existing);
        return toTripDTOWithPassengers(updated);
    }

    public void deleteTrip(int id) {
        tripRepository.deleteById(id);
    }

    // =========================
    // TRIP CLOSING + DISTANCE + CO2
    // =========================

    public TripResponseDTO endTrip(int tripId) {

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found"));

        if (!trip.isLive()) {
            throw new RuntimeException("Trip already ended");
        }

        // 1) Distance calculation
        double distanceKm = DistanceCalculator.calculateDistance(
                trip.getStartLat(),
                trip.getStartLon(),
                trip.getEndLat(),
                trip.getEndLon()
        );

        // 2) CO2 calculation (0.12 kg/km)
        double co2 = distanceKm * 0.12;

        // 3) Trip markings
        trip.setLive(false);
        tripRepository.save(trip);

        // 4) Driver stat update
        User driver = trip.getDriver();

        double newDistance = driver.getDistance() + distanceKm;
        double newCo2 = driver.getCo2() + co2;

        driver.setDistance(newDistance);
        driver.setCo2(newCo2);
        userRepository.save(driver);

        // 5) ResponseDTO
        TripResponseDTO dto = toTripDTOWithPassengers(trip);
        dto.setDistance(distanceKm);
        dto.setCo2(co2);

        return dto;
    }

    // =========================
    // TRIP SEARCH (10 km radius)
    // =========================

    public List<TripResponseDTO> searchTrips(double startLat, double startLon,
                                             double endLat, double endLon) {

        double delta = 0.1; // -+ 11 km bounding box

        // 1) DB pre-search
        List<Trip> raw = tripRepository.searchByBoundingBox(
                startLat - delta, startLat + delta,
                startLon - delta, startLon + delta,
                endLat - delta, endLat + delta,
                endLon - delta, endLon + delta
        );

        // 2) Valós távolságvizsgálat (10 km-en belül)
        return raw.stream()
                .filter(t -> {

                    double startDist = DistanceCalculator.haversine(
                            startLat, startLon,
                            t.getStartLat(), t.getStartLon()
                    );

                    double endDist = DistanceCalculator.haversine(
                            endLat, endLon,
                            t.getEndLat(), t.getEndLon()
                    );

                    return startDist <= 10 && endDist <= 10;
                })
                .map(this::toTripDTOWithPassengers)
                .toList();
    }

}
