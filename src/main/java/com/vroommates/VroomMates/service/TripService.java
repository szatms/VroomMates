package com.vroommates.VroomMates.service;

import com.vroommates.VroomMates.model.tripmodel.Trip;
import com.vroommates.VroomMates.model.tripmodel.TripRepository;
import com.vroommates.VroomMates.model.tripmodel.dto.TripRequestDTO;
import com.vroommates.VroomMates.model.tripmodel.dto.TripResponseDTO;
import com.vroommates.VroomMates.model.tripmodel.mapper.TripMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TripService {

    private final TripRepository tripRepository;
    private final TripMapper tripMapper;

    public TripResponseDTO createTrip(TripRequestDTO dto) {
        Trip saved = tripRepository.save(tripMapper.toEntity(dto));
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

        existing.setDriverID(dto.getDriverID());
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