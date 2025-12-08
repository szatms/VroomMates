package com.vroommates.VroomMates;

import com.vroommates.VroomMates.model.bookingmodel.BookingRepository;
import com.vroommates.VroomMates.model.bookingmodel.BookingStatus;
import com.vroommates.VroomMates.model.tripmodel.Trip;
import com.vroommates.VroomMates.model.tripmodel.TripRepository;
import com.vroommates.VroomMates.model.tripmodel.dto.TripRequestDTO;
import com.vroommates.VroomMates.model.tripmodel.dto.TripResponseDTO;
import com.vroommates.VroomMates.model.tripmodel.mapper.TripMapper;
import com.vroommates.VroomMates.model.usermodel.User;
import com.vroommates.VroomMates.model.usermodel.UserRepository;
import com.vroommates.VroomMates.model.vehiclemodel.Vehicle;
import com.vroommates.VroomMates.model.vehiclemodel.VehicleRepository;
import com.vroommates.VroomMates.service.TripService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.Optional;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class VroomMatesTripServiceTests {

    @Mock
    private TripRepository tripRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private VehicleRepository vehicleRepository;
    @Mock
    private BookingRepository bookingRepository;
    @Mock
    private TripMapper tripMapper;

    @InjectMocks
    private TripService tripService;

    private User driver;
    private Vehicle vehicle;
    private Trip trip;
    private TripRequestDTO tripRequestDTO;

    @BeforeEach
    void setUp() {
        driver = User.builder()
                .userId(1)
                .userName("Driver")
                .distance(0)
                .co2(0)
                .build();

        vehicle = new Vehicle();
        vehicle.setPlate("ABC-123");
        vehicle.setSeats(5);

        tripRequestDTO = new TripRequestDTO();
        tripRequestDTO.setDriverID(1);
        tripRequestDTO.setVehiclePlate("ABC-123");
        tripRequestDTO.setStartLat(47.5f);
        tripRequestDTO.setStartLon(19.0f);
        tripRequestDTO.setEndLat(48.0f);
        tripRequestDTO.setEndLon(20.0f);
        tripRequestDTO.setLive(true);

        trip = Trip.builder()
                .tripID(100)
                .driver(driver)
                .vehicle(vehicle)
                .isLive(true)
                .startLat(47.5f)
                .startLon(19.0f)
                .endLat(48.0f)
                .endLon(20.0f)
                .build();
    }


    // CREATE TRIP & SEAT CALCULATION

    @Test
    void createTrip_ShouldCalculateRemainingSeatsCorrectly() {
        // ARRANGE
        when(userRepository.findById(1)).thenReturn(Optional.of(driver));
        when(vehicleRepository.findById("ABC-123")).thenReturn(Optional.of(vehicle));
        when(tripMapper.toEntity(tripRequestDTO)).thenReturn(trip);
        when(tripRepository.save(trip)).thenReturn(trip);

        TripResponseDTO emptyDTO = TripResponseDTO.builder().build();
        when(tripMapper.toDTO(trip)).thenReturn(emptyDTO);

        when(bookingRepository.countByTripAndStatus(trip, BookingStatus.JOINED)).thenReturn(1);

        // ACT
        TripResponseDTO result = tripService.createTrip(tripRequestDTO);

        // ASSERT
        assertThat(result.getTotalSeats()).isEqualTo(5);
        assertThat(result.getPassengerCount()).isEqualTo(2);
        assertThat(result.getRemainingSeats()).isEqualTo(3);

        verify(tripRepository).save(trip);
    }

    @Test
    void createTrip_ShouldThrowException_WhenDriverNotFound() {
        // ARRANGE
        when(userRepository.findById(1)).thenReturn(Optional.empty());

        // ACT & ASSERT
        RuntimeException ex = assertThrows(RuntimeException.class, () -> tripService.createTrip(tripRequestDTO));
        assertThat(ex.getMessage()).isEqualTo("Driver not found");
    }

    // GET TRIP

    @Test
    void getTripById_ShouldReturnTrip_WhenExists() {
        // ARRANGE
        when(tripRepository.findById(100)).thenReturn(Optional.of(trip));
        when(tripMapper.toDTO(trip)).thenReturn(TripResponseDTO.builder().tripID(100).build());
        when(bookingRepository.countByTripAndStatus(trip, BookingStatus.JOINED)).thenReturn(0);

        // ACT
        TripResponseDTO result = tripService.getTripById(100);

        // ASSERT
        assertThat(result.getTripID()).isEqualTo(100);
        assertThat(result.getRemainingSeats()).isEqualTo(4);
    }


    // UPDATE TRIP

    @Test
    void updateTrip_ShouldUpdateFields_WhenExists() {
        // ARRANGE
        when(tripRepository.findById(100)).thenReturn(Optional.of(trip));
        when(userRepository.findById(1)).thenReturn(Optional.of(driver));
        when(vehicleRepository.findById("ABC-123")).thenReturn(Optional.of(vehicle));
        when(tripRepository.save(trip)).thenReturn(trip);
        when(tripMapper.toDTO(trip)).thenReturn(TripResponseDTO.builder().build());

        tripRequestDTO.setStartLat(10.0f);

        // ACT
        tripService.updateTrip(100, tripRequestDTO);

        // ASSERT
        assertThat(trip.getStartLat()).isEqualTo(10.0f);
        verify(tripRepository).save(trip);
    }

    // END TRIP

    @Test
    void endTrip_ShouldCalculateStats_AndCloseTrip() {
        // ARRANGE
        when(tripRepository.findById(100)).thenReturn(Optional.of(trip));

        when(tripMapper.toDTO(trip)).thenReturn(TripResponseDTO.builder().build());

        // ACT
        TripResponseDTO result = tripService.endTrip(100);

        // ASSERT

        assertThat(trip.isLive()).isFalse();
        verify(tripRepository).save(trip);

        verify(userRepository).save(driver);

        assertThat(driver.getDistance()).isGreaterThan(0);
        assertThat(driver.getCo2()).isGreaterThan(0);

        assertThat(result.getDistance()).isGreaterThan(0);
        assertThat(result.getCo2()).isGreaterThan(0);
    }

    @Test
    void endTrip_ShouldThrowException_WhenTripAlreadyEnded() {
        // ARRANGE
        trip.setLive(false); // Már lezárt fuvar
        when(tripRepository.findById(100)).thenReturn(Optional.of(trip));

        // ACT & ASSERT
        RuntimeException ex = assertThrows(RuntimeException.class, () -> tripService.endTrip(100));
        assertThat(ex.getMessage()).isEqualTo("Trip already ended");

        verify(userRepository, never()).save(any());
    }

    @Test
    void endTrip_ShouldHandleNullDriverStats() {
        // ARRANGE
        driver.setDistance(null);
        driver.setCo2(null);

        when(tripRepository.findById(100)).thenReturn(Optional.of(trip));
        when(tripMapper.toDTO(trip)).thenReturn(TripResponseDTO.builder().build());

        // ACT
        tripService.endTrip(100);

        // ASSERT
        assertThat(driver.getDistance()).isNotNull();
        assertThat(driver.getCo2()).isNotNull();
        verify(userRepository).save(driver);
    }
}
