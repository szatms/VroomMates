package com.vroommates.VroomMates;

import com.vroommates.VroomMates.model.bookingmodel.Booking;
import com.vroommates.VroomMates.model.bookingmodel.BookingRepository;
import com.vroommates.VroomMates.model.bookingmodel.BookingStatus;
import com.vroommates.VroomMates.model.bookingmodel.dto.BookingRequestDTO;
import com.vroommates.VroomMates.model.bookingmodel.dto.BookingResponseDTO;
import com.vroommates.VroomMates.model.bookingmodel.dto.PassengerResponseDTO;
import com.vroommates.VroomMates.model.bookingmodel.mapper.BookingMapper;
import com.vroommates.VroomMates.model.tripmodel.Trip;
import com.vroommates.VroomMates.model.tripmodel.TripRepository;
import com.vroommates.VroomMates.model.usermodel.User;
import com.vroommates.VroomMates.model.usermodel.UserRepository;

import com.vroommates.VroomMates.model.vehiclemodel.Vehicle;
import com.vroommates.VroomMates.service.BookingService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class VroomMatesBookingServiceTests {
    @Mock
    private BookingRepository bookingRepository;
    @Mock
    private TripRepository tripRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private BookingMapper bookingMapper;

    @Mock
    private SecurityContext securityContext;
    @Mock
    private Authentication authentication;

    @InjectMocks
    private BookingService bookingService;

    private Trip testTrip;
    private User passenger;
    private User driver;
    private Vehicle testVehicle;

    @BeforeEach
    void setUp() {

        driver = User.builder().userId(1).email("driver@test.com").userName("Driver").build();
        passenger = User.builder().userId(2).email("passenger@test.com").userName("Passenger").build();

        testVehicle = new Vehicle();
        testVehicle.setSeats(4);

        testTrip = Trip.builder()
                .tripID(100)
                .driver(driver)
                .vehicle(testVehicle)
                .build();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    // JOIN TRIP TESTS
    @Test
    void joinTrip_ShouldCreatePendingBooking_WhenValid() {
        // ARRANGE
        BookingRequestDTO request = new BookingRequestDTO();
        request.setTripID(100);
        request.setUserID(2);

        when(tripRepository.findById(100)).thenReturn(Optional.of(testTrip));
        when(userRepository.findById(2)).thenReturn(Optional.of(passenger));

        when(bookingRepository.findByTripAndUser(testTrip, passenger)).thenReturn(Optional.empty());

        when(bookingRepository.countByTripAndStatus(testTrip, BookingStatus.JOINED)).thenReturn(0);

        // Mapper mock
        BookingResponseDTO expectedResponse = BookingResponseDTO.builder().status(BookingStatus.PENDING).build();
        when(bookingMapper.toDTO(any(Booking.class))).thenReturn(expectedResponse);

        // ACT
        BookingResponseDTO result = bookingService.joinTrip(request);

        // ASSERT
        assertThat(result.getStatus()).isEqualTo(BookingStatus.PENDING);


        verify(bookingRepository).save(argThat(booking ->
                booking.getStatus() == BookingStatus.PENDING &&
                        booking.getUser().equals(passenger)
        ));
    }

    @Test
    void joinTrip_ShouldThrowException_WhenDriverTriesToJoin() {
        // ARRANGE
        BookingRequestDTO request = new BookingRequestDTO();
        request.setTripID(100);
        request.setUserID(1);

        when(tripRepository.findById(100)).thenReturn(Optional.of(testTrip));
        when(userRepository.findById(1)).thenReturn(Optional.of(driver));

        // ACT & ASSERT
        RuntimeException ex = assertThrows(RuntimeException.class, () -> bookingService.joinTrip(request));
        assertThat(ex.getMessage()).isEqualTo("Driver cannot join their own trip.");
    }

    @Test
    void joinTrip_ShouldThrowException_WhenTripIsFull() {
        // ARRANGE
        BookingRequestDTO request = new BookingRequestDTO();
        request.setTripID(100);
        request.setUserID(2);

        when(tripRepository.findById(100)).thenReturn(Optional.of(testTrip));
        when(userRepository.findById(2)).thenReturn(Optional.of(passenger));
        when(bookingRepository.findByTripAndUser(testTrip, passenger)).thenReturn(Optional.empty());

        when(bookingRepository.countByTripAndStatus(testTrip, BookingStatus.JOINED)).thenReturn(3);

        // ACT & ASSERT
        RuntimeException ex = assertThrows(RuntimeException.class, () -> bookingService.joinTrip(request));
        assertThat(ex.getMessage()).isEqualTo("Trip is full.");
    }

    // ACCEPT BOOKING TESTS
    @Test
    void acceptBooking_ShouldUpdateStatusToJoined_WhenDriverApproves() {
        // ARRANGE
        Long bookingId = 50L;
        Booking pendingBooking = Booking.builder()
                .bookingID(bookingId)
                .trip(testTrip) // A trip driverje: driver@test.com
                .user(passenger)
                .status(BookingStatus.PENDING)
                .build();

        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(pendingBooking));
        when(bookingRepository.countByTripAndStatus(testTrip, BookingStatus.JOINED)).thenReturn(0);

        // SETTING SECURITY MOCK

        mockSecurityContext("driver@test.com");

        // Mapper
        when(bookingMapper.toDTO(pendingBooking)).thenReturn(BookingResponseDTO.builder().status(BookingStatus.JOINED).build());

        // ACT
        BookingResponseDTO result = bookingService.acceptBooking(bookingId);

        // ASSERT
        assertThat(result.getStatus()).isEqualTo(BookingStatus.JOINED);
        assertThat(pendingBooking.getStatus()).isEqualTo(BookingStatus.JOINED);
        verify(bookingRepository).save(pendingBooking);
    }

    @Test
    void acceptBooking_ShouldThrowException_WhenNotDriver() {
        // ARRANGE
        Long bookingId = 50L;
        Booking pendingBooking = Booking.builder()
                .bookingID(bookingId)
                .trip(testTrip)
                .build();

        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(pendingBooking));

        // SECURITY MOCK

        mockSecurityContext("hacker@test.com");

        // ACT & ASSERT
        RuntimeException ex = assertThrows(RuntimeException.class, () -> bookingService.acceptBooking(bookingId));
        assertThat(ex.getMessage()).isEqualTo("Only the driver can manage bookings for this trip.");
    }


    // PASSENGER LISTS TESTS
    @Test
    void getPassengersForTrip_ShouldReturnList() {
        // ARRANGE
        Booking activeBooking = Booking.builder()
                .trip(testTrip)
                .user(passenger)
                .status(BookingStatus.JOINED)
                .build();

        when(tripRepository.findById(100)).thenReturn(Optional.of(testTrip));
        when(bookingRepository.findByTripAndStatus(testTrip, BookingStatus.JOINED))
                .thenReturn(List.of(activeBooking));

        // ACT
        List<PassengerResponseDTO> result = bookingService.getPassengersForTrip(100);

        // ASSERT
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getEmail()).isEqualTo("passenger@test.com");
    }

    // ADDITIONAL METHODS FOR MOCK SECURITY
    private void mockSecurityContext(String email) {
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn(email);
        SecurityContextHolder.setContext(securityContext);
    }
}
