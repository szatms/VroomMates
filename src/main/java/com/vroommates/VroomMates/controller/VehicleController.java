package com.vroommates.VroomMates.controller;

import com.vroommates.VroomMates.model.vehiclemodel.dto.VehicleRequestDTO;
import com.vroommates.VroomMates.model.vehiclemodel.dto.VehicleResponseDTO;
import com.vroommates.VroomMates.service.VehicleService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
@RequiredArgsConstructor
public class VehicleController {

    private final VehicleService vehicleService;

    @PostMapping
    public VehicleResponseDTO create(@RequestBody VehicleRequestDTO dto) {
        return vehicleService.createVehicle(dto);
    }

    @GetMapping("/{plate}")
    public VehicleResponseDTO get(@PathVariable String plate) {
        return vehicleService.getVehicle(plate);
    }

    @GetMapping
    public List<VehicleResponseDTO> getAll() {
        return vehicleService.getAllVehicles();
    }

    @PutMapping("/{plate}")
    public VehicleResponseDTO update(@PathVariable String plate,
                                     @RequestBody VehicleRequestDTO dto) {
        return vehicleService.updateVehicle(plate, dto);
    }

    @DeleteMapping("/{plate}")
    public void delete(@PathVariable String plate) {
        vehicleService.deleteVehicle(plate);
    }
}