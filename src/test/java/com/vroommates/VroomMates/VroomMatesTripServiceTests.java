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
import java.time.LocalDateTime;
import java.util.List;
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
    private TripResponseDTO tripResponseDTO;

    @BeforeEach
    void setUp() {
        driver = User.builder()
                .userId(1)
                .userName("Driver")
                .distance(100)
                .co2(50.0)
                .build();

        vehicle = new Vehicle();
        vehicle.setPlate("ABC-123");
        vehicle.setSeats(5);

        tripRequestDTO = new TripRequestDTO();
        tripRequestDTO.setDriverID(1);
        tripRequestDTO.setDepartureTime(LocalDateTime.now().plusHours(1));
        tripRequestDTO.setStartLat(47.4947);
        tripRequestDTO.setStartLon(19.0402);
        tripRequestDTO.setEndLat(48.5300);
        tripRequestDTO.setEndLon(20.0800);


        trip = Trip.builder()
                .tripID(100)
                .driver(driver)
                .vehicle(vehicle)
                .isLive(true)
                .startLat(47.4947)
                .startLon(19.0402)
                .endLat(47.5300)
                .endLon(19.0800)
                .build();

        tripResponseDTO = TripResponseDTO.builder()
                .tripID(100)
                .driverID(1)
                .isLive(true)
                .build();

    }


    // CREATE TRIP & SEAT CALCULATION

    @Test
    void createTrip_ShouldAssignVehicleAndCalculateSeats() {
        // ARRANGE
        when(userRepository.findById(1)).thenReturn(Optional.of(driver));
        when(vehicleRepository.findFirstByOwner(driver)).thenReturn(Optional.of(vehicle));

        when(tripMapper.toEntity(tripRequestDTO)).thenReturn(trip);
        when(tripRepository.save(trip)).thenReturn(trip);
        when(tripMapper.toDTO(trip)).thenReturn(tripResponseDTO);

        when(bookingRepository.countByTripAndStatus(trip, BookingStatus.JOINED)).thenReturn(1);

        // ACT
        TripResponseDTO result = tripService.createTrip(tripRequestDTO);

        // ASSERT
        assertThat(trip.getVehicle()).isEqualTo(vehicle);
        assertThat(result.getTotalSeats()).isEqualTo(5);
        assertThat(result.getPassengerCount()).isEqualTo(2);
        assertThat(result.getRemainingSeats()).isEqualTo(3);

        verify(tripRepository).save(trip);
    }

    @Test
    void createTrip_ShouldThrowException_WhenDriverHasNoVehicle() {
        // ARRANGE
        when(userRepository.findById(1)).thenReturn(Optional.of(driver));
        when(vehicleRepository.findFirstByOwner(driver)).thenReturn(Optional.empty());

        // ACT & ASSERT
        RuntimeException ex = assertThrows(RuntimeException.class, () -> tripService.createTrip(tripRequestDTO));
        assertThat(ex.getMessage()).isEqualTo("Driver has no registered vehicle");
    }

    // SEARCH TRIP

    @Test
    void searchTrips_ShouldFilterByExactDistance() {
        // ARRANGE
        double searchLat = 47.4979;
        double searchLon = 19.0402;

        Trip tripClose = Trip.builder()
                .tripID(1)
                .driver(driver).vehicle(vehicle)
                .startLat(47.4979).startLon(19.0402)
                .endLat(47.4979).endLon(19.0402)
                .build();

        Trip tripFar = Trip.builder()
                .tripID(2)
                .driver(driver).vehicle(vehicle)
                .startLat(47.5).startLon(21.6)
                .endLat(47.5).endLon(21.6)
                .build();

        when(tripRepository.searchByBoundingBox(anyDouble(), anyDouble(), anyDouble(), anyDouble(), anyDouble(), anyDouble(), anyDouble(), anyDouble()))
                .thenReturn(List.of(tripClose, tripFar));

        when(tripMapper.toDTO(tripClose)).thenReturn(TripResponseDTO.builder().tripID(1).build());
        when(bookingRepository.countByTripAndStatus(any(), any())).thenReturn(0);

        // ACT
        List<TripResponseDTO> results = tripService.searchTrips(searchLat, searchLon, searchLat, searchLon);


        // ASSERT
        assertThat(results).hasSize(1);
        assertThat(results.get(0).getTripID()).isEqualTo(1);

        verify(tripRepository).searchByBoundingBox(
                eq(searchLat - 0.1), eq(searchLat + 0.1),
                eq(searchLon - 0.1), eq(searchLon + 0.1),
                eq(searchLat - 0.1), eq(searchLat + 0.1),
                eq(searchLon - 0.1), eq(searchLon + 0.1)
        );
    }


    // UPDATE TRIP

    @Test
    void updateTrip_ShouldRefreshVehicleFromDriver() {
        // ARRANGE
        TripRequestDTO updateDTO = new TripRequestDTO();
        updateDTO.setDriverID(1);
        updateDTO.setTripMessage("Updated msg");
        updateDTO.setIsLive(false);

        when(tripRepository.findById(100)).thenReturn(Optional.of(trip));
        when(userRepository.findById(1)).thenReturn(Optional.of(driver));
        when(vehicleRepository.findFirstByOwner(driver)).thenReturn(Optional.of(vehicle));
        when(tripRepository.save(trip)).thenReturn(trip);
        when(tripMapper.toDTO(trip)).thenReturn(tripResponseDTO);

        // ACT
        tripService.updateTrip(100, updateDTO);

        // ASSERT
        assertThat(trip.getTripMessage()).isEqualTo("Updated msg");
        assertThat(trip.isLive()).isFalse();

        verify(vehicleRepository).findFirstByOwner(driver);
    }

    // END TRIP

    @Test
    void endTrip_ShouldCalculateStatsAndUpdateDriver() {
        // ARRANGE
        trip.setStartLat(0.0);
        trip.setStartLon(0.0);
        trip.setEndLat(1.0);
        trip.setEndLon(1.0);

        when(tripRepository.findById(100)).thenReturn(Optional.of(trip));
        when(tripMapper.toDTO(trip)).thenReturn(tripResponseDTO);
        when(bookingRepository.countByTripAndStatus(trip, BookingStatus.JOINED)).thenReturn(0);

        double initialDriverDistance = driver.getDistance();
        double initialDriverCo2 = driver.getCo2();

        // ACT
        TripResponseDTO result = tripService.endTrip(100);

        // ASSERT
        assertThat(trip.isLive()).isFalse();
        verify(tripRepository).save(trip);

        assertThat(driver.getDistance()).isGreaterThan(initialDriverDistance);
        assertThat(driver.getCo2()).isGreaterThan(initialDriverCo2);

        verify(userRepository).save(driver);

        assertThat(result.getDistance()).isGreaterThan(0);
        assertThat(result.getCo2()).isGreaterThan(0);
    }

    @Test
    void endTrip_ShouldThrowException_WhenTripAlreadyEnded() {
        // ARRANGE
        trip.setLive(false);
        when(tripRepository.findById(100)).thenReturn(Optional.of(trip));

        // ACT & ASSERT
        RuntimeException ex = assertThrows(RuntimeException.class, () -> tripService.endTrip(100));
        assertThat(ex.getMessage()).isEqualTo("Trip already ended");

        verify(userRepository, never()).save(any());
    }
}
