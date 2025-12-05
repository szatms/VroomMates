package com.vroommates.VroomMates.model.vehiclemodel.mapper;

import com.vroommates.VroomMates.model.vehiclemodel.Vehicle;
import com.vroommates.VroomMates.model.vehiclemodel.dto.VehicleRequestDTO;
import com.vroommates.VroomMates.model.vehiclemodel.dto.VehicleResponseDTO;
import org.springframework.stereotype.Component;

@Component
public class VehicleMapper {

    public Vehicle toEntity(VehicleRequestDTO dto) {
        return Vehicle.builder()
                .plate(dto.getPlate())
                .ownerID(dto.getOwnerID())
                .seats(dto.getSeats())
                .make(dto.getMake())
                .model(dto.getModel())
                .year(dto.getYear())
                .colour(dto.getColour())
                .fuel(dto.getFuel())
                .picture(dto.getPicture())
                .build();
    }

    public VehicleResponseDTO toDTO(Vehicle entity) {
        return VehicleResponseDTO.builder()
                .plate(entity.getPlate())
                .ownerID(entity.getOwnerID())
                .seats(entity.getSeats())
                .make(entity.getMake())
                .model(entity.getModel())
                .year(entity.getYear())
                .colour(entity.getColour())
                .fuel(entity.getFuel())
                .picture(entity.getPicture())
                .build();
    }
}
