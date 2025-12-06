package com.vroommates.VroomMates.service;

import com.vroommates.VroomMates.model.tripmodel.Trip;
import com.vroommates.VroomMates.model.tripmodel.TripRepository;
import com.vroommates.VroomMates.model.tripmodel.dto.TripRequestDTO;
import com.vroommates.VroomMates.model.tripmodel.dto.TripResponseDTO;
import com.vroommates.VroomMates.model.tripmodel.mapper.TripMapper;
import com.vroommates.VroomMates.model.usermodel.User;
import com.vroommates.VroomMates.model.usermodel.UserRepository;
import com.vroommates.VroomMates.model.vehiclemodel.Vehicle;
import com.vroommates.VroomMates.model.vehiclemodel.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TripService {

    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;
    private final TripMapper tripMapper;

    public TripResponseDTO createTrip(TripRequestDTO dto) {

        User driver = userRepository.findById(dto.getDriverID())
                .orElseThrow(() -> new RuntimeException("Driver not found"));

        Vehicle vehicle = vehicleRepository.findById(dto.getVehiclePlate())
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        Trip trip = tripMapper.toEntity(dto);
        trip.setDriver(driver);
        trip.setVehicle(vehicle);

        Trip saved = tripRepository.save(trip);
        return tripMapper.toDTO(saved);
    }

    public TripResponseDTO getTripById(int id) {
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Trip not found"));
        return tripMapper.toDTO(trip);
    }

    public List<TripResponseDTO> getAllTrips() {
        return tripRepository.findAll()
                .stream()
                .map(tripMapper::toDTO)
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
        existing.setStartLat(dto.getStartLat());
        existing.setStartLon(dto.getStartLon());
        existing.setEndLat(dto.getEndLat());
        existing.setEndLon(dto.getEndLon());

        Trip updated = tripRepository.save(existing);
        return tripMapper.toDTO(updated);
    }

    public void deleteTrip(int id) {
        tripRepository.deleteById(id);
    }
}