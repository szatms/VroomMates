package com.vroommates.VroomMates.controller;

import com.vroommates.VroomMates.model.tripmodel.dto.TripRequestDTO;
import com.vroommates.VroomMates.model.tripmodel.dto.TripResponseDTO;
import com.vroommates.VroomMates.service.TripService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trips")
@RequiredArgsConstructor
public class TripController {

    private final TripService tripService;

    @PostMapping
    public TripResponseDTO createTrip(@RequestBody TripRequestDTO dto) {
        return tripService.createTrip(dto);
    }

    @PostMapping("/{id}/finish")
    public void finishTrip(@PathVariable int id) {
        tripService.finishTrip(id);
    }

    @GetMapping("/{id}")
    public TripResponseDTO getTrip(@PathVariable int id) {
        return tripService.getTripById(id);
    }

    @GetMapping
    public List<TripResponseDTO> getAllTrips() {
        return tripService.getAllTrips();
    }

    @PutMapping("/{id}")
    public TripResponseDTO updateTrip(
            @PathVariable int id,
            @RequestBody TripRequestDTO dto
    ) {
        return tripService.updateTrip(id, dto);
    }

    @DeleteMapping("/{id}")
    public void deleteTrip(@PathVariable int id) {
        tripService.deleteTrip(id);
    }
}