package com.vroommates.VroomMates.service;

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

    public VehicleResponseDTO createVehicle(VehicleRequestDTO dto) {
        Vehicle saved = vehicleRepository.save(vehicleMapper.toEntity(dto));
        return vehicleMapper.toDTO(saved);
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

        existing.setOwnerID(dto.getOwnerID());
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
}
