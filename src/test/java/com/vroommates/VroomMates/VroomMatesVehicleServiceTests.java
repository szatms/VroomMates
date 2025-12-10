package com.vroommates.VroomMates;

import com.vroommates.VroomMates.model.usermodel.User;
import com.vroommates.VroomMates.model.usermodel.UserRepository;
import com.vroommates.VroomMates.model.vehiclemodel.Vehicle;
import com.vroommates.VroomMates.model.vehiclemodel.VehicleRepository;
import com.vroommates.VroomMates.model.vehiclemodel.dto.VehicleRequestDTO;
import com.vroommates.VroomMates.model.vehiclemodel.dto.VehicleResponseDTO;
import com.vroommates.VroomMates.model.vehiclemodel.mapper.VehicleMapper;
import com.vroommates.VroomMates.service.VehicleService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.List;
import java.util.Optional;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VroomMatesVehicleServiceTests {

    @Mock
    private VehicleRepository vehicleRepository;
    @Mock
    private VehicleMapper vehicleMapper;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private VehicleService vehicleService;

    private User owner;
    private Vehicle vehicle;
    private VehicleRequestDTO requestDTO;
    private VehicleResponseDTO responseDTO;
    private final String PLATE = "ABC-123";

    @BeforeEach
    void setUp() {
        owner = User.builder()
                .userId(1)
                .userName("TestOwner")
                .build();

        requestDTO = new VehicleRequestDTO();
        requestDTO.setPlate(PLATE);
        requestDTO.setOwnerID(1);
        requestDTO.setMake("Toyota");
        requestDTO.setModel("Corolla");
        requestDTO.setSeats(5);
        requestDTO.setSeats(5);
        requestDTO.setYear(2020);
        requestDTO.setColour("Red");
        requestDTO.setFuel("Petrol");
        requestDTO.setPicture("base64string...");

        vehicle = Vehicle.builder()
                .plate(PLATE)
                .owner(owner)
                .make("Toyota")
                .model("Corolla")
                .seats(5)
                .year(2020)
                .colour("Red")
                .fuel("Petrol")
                .picture("base64string...")
                .build();

        responseDTO = VehicleResponseDTO.builder()
                .plate(PLATE)
                .ownerID(1)
                .make("Toyota")
                .model("Corolla")
                .build();
    }

    // CREATE VEHICLE

    @Test
    void createVehicle_ShouldThrowException_WhenUserNotFound() {
        // ARRANGE
        when(userRepository.findById(1)).thenReturn(Optional.empty());

        // ACT & ASSERT
        RuntimeException ex = assertThrows(RuntimeException.class, () -> vehicleService.createVehicle(requestDTO));
        assertThat(ex.getMessage()).isEqualTo("User not found");

        verify(vehicleRepository, never()).save(any());
    }

    // GET VEHICLE

    @Test
    void getVehicle_ShouldReturnDTO_WhenExists() {
        // ARRANGE
        when(vehicleRepository.findById(PLATE)).thenReturn(Optional.of(vehicle));
        when(vehicleMapper.toDTO(vehicle)).thenReturn(responseDTO);

        // ACT
        VehicleResponseDTO result = vehicleService.getVehicle(PLATE);

        // ASSERT
        assertThat(result.getPlate()).isEqualTo(PLATE);
    }

    @Test
    void getVehicle_ShouldThrowException_WhenNotFound() {
        // ARRANGE
        when(vehicleRepository.findById(PLATE)).thenReturn(Optional.empty());

        // ACT & ASSERT
        RuntimeException ex = assertThrows(RuntimeException.class, () -> vehicleService.getVehicle(PLATE));
        assertThat(ex.getMessage()).isEqualTo("Vehicle not found");
    }


    // GET ALL VEHICLES

    @Test
    void getAllVehicles_ShouldReturnList() {
        // ARRANGE
        when(vehicleRepository.findAll()).thenReturn(List.of(vehicle));
        when(vehicleMapper.toDTO(vehicle)).thenReturn(responseDTO);

        // ACT
        List<VehicleResponseDTO> result = vehicleService.getAllVehicles();

        // ASSERT
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getPlate()).isEqualTo(PLATE);
    }


    // UPDATE VEHICLE

    @Test
    void updateVehicle_ShouldUpdateFields_WhenExists() {
        // ARRANGE
        requestDTO.setMake("Honda");
        requestDTO.setModel("Civic");
        requestDTO.setYear(2022);
        requestDTO.setColour("Blue");
        requestDTO.setFuel("Hybrid");
        requestDTO.setPicture("newpic...");
        requestDTO.setSeats(4);
        requestDTO.setOwnerID(1);

        when(vehicleRepository.findById(PLATE)).thenReturn(Optional.of(vehicle));
        when(userRepository.findById(1)).thenReturn(Optional.of(owner));
        when(vehicleRepository.save(vehicle)).thenReturn(vehicle);

        VehicleResponseDTO updatedResponse = VehicleResponseDTO.builder().model("Honda").build();
        when(vehicleMapper.toDTO(vehicle)).thenReturn(updatedResponse);

        // ACT
        vehicleService.updateVehicle(PLATE, requestDTO);

        // ASSERT
        assertThat(vehicle.getMake()).isEqualTo("Honda"); // Toyota -> Honda
        assertThat(vehicle.getModel()).isEqualTo("Civic");
        assertThat(vehicle.getYear()).isEqualTo(2022);
        assertThat(vehicle.getColour()).isEqualTo("Blue");
        assertThat(vehicle.getFuel()).isEqualTo("Hybrid");
        assertThat(vehicle.getPicture()).isEqualTo("newpic...");
        assertThat(vehicle.getSeats()).isEqualTo(4);

        verify(vehicleRepository).save(vehicle);
    }

    @Test
    void updateVehicle_ShouldUpdateOwner_WhenOwnerIdChanges() {
        // ARRANGE
        requestDTO.setOwnerID(99);
        User newOwner = User.builder().userId(99).userName("NewOwner").build();

        when(vehicleRepository.findById(PLATE)).thenReturn(Optional.of(vehicle));
        when(userRepository.findById(99)).thenReturn(Optional.of(newOwner));

        when(vehicleRepository.save(vehicle)).thenReturn(vehicle);
        when(vehicleMapper.toDTO(vehicle)).thenReturn(responseDTO);

        // ACT
        vehicleService.updateVehicle(PLATE, requestDTO);

        // ASSERT
        assertThat(vehicle.getOwner()).isEqualTo(newOwner);
    }

    @Test
    void updateVehicle_ShouldThrowException_WhenVehicleNotFound() {
        // ARRANGE
        when(vehicleRepository.findById(PLATE)).thenReturn(Optional.empty());

        // ACT & ASSERT
        RuntimeException ex = assertThrows(RuntimeException.class, () -> vehicleService.updateVehicle(PLATE, requestDTO));
        assertThat(ex.getMessage()).isEqualTo("Vehicle not found");
    }

    @Test
    void updateVehicle_ShouldThrowException_WhenNewOwnerNotFound() {
        // ARRANGE
        when(vehicleRepository.findById(PLATE)).thenReturn(Optional.of(vehicle));

        when(userRepository.findById(requestDTO.getOwnerID())).thenReturn(Optional.empty());

        // ACT & ASSERT
        RuntimeException ex = assertThrows(RuntimeException.class, () -> vehicleService.updateVehicle(PLATE, requestDTO));
        assertThat(ex.getMessage()).isEqualTo("Owner not found");
    }


    // DELETE VEHICLE

    @Test
    void deleteVehicle_ShouldCallRepositoryDelete() {
        // ACT
        vehicleService.deleteVehicle(PLATE);

        // ASSERT
        verify(vehicleRepository).deleteById(PLATE);
    }
}
