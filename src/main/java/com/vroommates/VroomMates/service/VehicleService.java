package com.vroommates.VroomMates.service;

import com.vroommates.VroomMates.model.usermodel.User;
import com.vroommates.VroomMates.model.usermodel.UserRepository;
import com.vroommates.VroomMates.model.vehiclemodel.Vehicle;
import com.vroommates.VroomMates.model.vehiclemodel.VehicleRepository;
import com.vroommates.VroomMates.model.vehiclemodel.dto.VehicleRequestDTO;
import com.vroommates.VroomMates.model.vehiclemodel.dto.VehicleResponseDTO;
import com.vroommates.VroomMates.model.vehiclemodel.mapper.VehicleMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final VehicleMapper vehicleMapper;
    private final UserRepository userRepository;

    public VehicleResponseDTO createVehicle(VehicleRequestDTO dto) {

        User owner = userRepository.findById(dto.getOwnerID())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Vehicle vehicle = vehicleMapper.toEntity(dto);
        vehicle.setOwner(owner);

        vehicleRepository.save(vehicle);

        return vehicleMapper.toDTO(vehicle);
    }

    public VehicleResponseDTO getVehicle(String plate) {
        Vehicle v = vehicleRepository.findById(plate)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        return vehicleMapper.toDTO(v);
    }

    public List<VehicleResponseDTO> getAllVehicles() {
        return vehicleRepository.findAll()
                .stream()
                .map(vehicleMapper::toDTO)
                .toList();
    }

    public VehicleResponseDTO updateVehicle(String plate, VehicleRequestDTO dto) {

        Vehicle existing = vehicleRepository.findById(plate)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        // Owner lekérése új ownerID alapján
        User owner = userRepository.findById(dto.getOwnerID())
                .orElseThrow(() -> new RuntimeException("Owner not found"));

        // Üzleti mezők frissítése
        existing.setOwner(owner);
        existing.setSeats(dto.getSeats());
        existing.setMake(dto.getMake());
        existing.setModel(dto.getModel());
        existing.setYear(dto.getYear());
        existing.setColour(dto.getColour());
        existing.setFuel(dto.getFuel());
        existing.setPicture(dto.getPicture());

        Vehicle updated = vehicleRepository.save(existing);
        return vehicleMapper.toDTO(updated);
    }

    public void deleteVehicle(String plate) {
        vehicleRepository.deleteById(plate);
    }

    public VehicleResponseDTO getVehicleByOwner(int ownerId) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return vehicleRepository.findFirstByOwner(owner)
                .map(vehicleMapper::toDTO)
                .orElse(null);
    }
}
