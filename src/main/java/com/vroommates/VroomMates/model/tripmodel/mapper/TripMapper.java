package com.vroommates.VroomMates.model.tripmodel.mapper;

import com.vroommates.VroomMates.model.tripmodel.Trip;
import com.vroommates.VroomMates.model.tripmodel.dto.TripRequestDTO;
import com.vroommates.VroomMates.model.tripmodel.dto.TripResponseDTO;
import org.springframework.stereotype.Component;

@Component
public class TripMapper {

    public Trip toEntity(TripRequestDTO dto) {
        return Trip.builder()
                .isLive(true)
                .departureTime(dto.getDepartureTime())
                .startLat(dto.getStartLat())
                .startLon(dto.getStartLon())
                .endLat(dto.getEndLat())
                .endLon(dto.getEndLon())
                .tripMessage(dto.getTripMessage())
                .build();
    }

    public TripResponseDTO toDTO(Trip entity) {
        return TripResponseDTO.builder()
                .tripID(entity.getTripID())
                .driverID(entity.getDriver().getUserId())
                .vehiclePlate(entity.getVehicle().getPlate())
                .isLive(entity.isLive())
                .departureTime(entity.getDepartureTime())
                .startLat(entity.getStartLat())
                .startLon(entity.getStartLon())
                .endLat(entity.getEndLat())
                .endLon(entity.getEndLon())
                .tripMessage(entity.getTripMessage()) // ÚJ
                .build();
    }
}

