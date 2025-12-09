package com.vroommates.VroomMates.model.vehiclemodel;

import com.vroommates.VroomMates.model.usermodel.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface VehicleRepository extends JpaRepository<Vehicle, String> {
    Optional<Vehicle> findFirstByOwner(User owner);
}
