package com.vroommates.VroomMates;

import com.vroommates.VroomMates.model.bookingmodel.Booking;
import com.vroommates.VroomMates.model.bookingmodel.BookingRepository;
import com.vroommates.VroomMates.model.bookingmodel.BookingStatus;
import com.vroommates.VroomMates.model.ratingmodel.Rating;
import com.vroommates.VroomMates.model.ratingmodel.RatingRepository;
import com.vroommates.VroomMates.model.ratingmodel.dto.RatingRequestDTO;
import com.vroommates.VroomMates.model.tripmodel.Trip;
import com.vroommates.VroomMates.model.tripmodel.TripRepository;
import com.vroommates.VroomMates.model.usermodel.User;
import com.vroommates.VroomMates.model.usermodel.UserRepository;
import com.vroommates.VroomMates.service.RatingService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class VroomMatesRatingServiceTests {
    @Mock
    private RatingRepository ratingRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private TripRepository tripRepository;
    @Mock
    private BookingRepository bookingRepository;

    // Security mocks
    @Mock
    private SecurityContext securityContext;
    @Mock
    private Authentication authentication;

    @InjectMocks
    private RatingService ratingService;

    @Captor
    private ArgumentCaptor<Rating> ratingCaptor;

    private User driver;
    private User passenger;
    private User otherPassenger;
    private Trip trip;

    @BeforeEach
    void setUp() {
        driver = User.builder().userId(1).email("driver@test.com").userName("Driver").build();
        passenger = User.builder().userId(2).email("passenger@test.com").userName("Passenger").build();
        otherPassenger = User.builder().userId(3).email("other@test.com").userName("Other").build();

        trip = Trip.builder()
                .tripID(100)
                .driver(driver)
                .build();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    // PASSENGER RATES DRIVER

    @Test
    void submitRating_ShouldSaveRating_WhenPassengerRatesDriver() {
        // ARRANGE
        mockSecurityContext("passenger@test.com");

        RatingRequestDTO dto = new RatingRequestDTO();
        dto.setTripId(100);
        dto.setRatedUserId(1);
        dto.setScore(5);
        dto.setComment("Great driver!");

        when(userRepository.findByEmail("passenger@test.com")).thenReturn(Optional.of(passenger));
        when(userRepository.findById(1)).thenReturn(Optional.of(driver));
        when(tripRepository.findById(100)).thenReturn(Optional.of(trip));


        Booking validBooking = Booking.builder().user(passenger).trip(trip).status(BookingStatus.JOINED).build();
        when(bookingRepository.findByTripAndUser(trip, passenger)).thenReturn(Optional.of(validBooking));

        // ACT
        ratingService.submitRating(dto);

        // ASSERT
        verify(ratingRepository).save(ratingCaptor.capture());
        Rating savedRating = ratingCaptor.getValue();

        assertThat(savedRating.getRater()).isEqualTo(passenger);
        assertThat(savedRating.getRatedUser()).isEqualTo(driver);
        assertThat(savedRating.getIsDriverRating()).isTrue();
        assertThat(savedRating.getScore()).isEqualTo(5);
    }


    // DRIVER RATES PASSENGER

    @Test
    void submitRating_ShouldSaveRating_WhenDriverRatesPassenger() {
        // ARRANGE
        mockSecurityContext("driver@test.com");

        RatingRequestDTO dto = new RatingRequestDTO();
        dto.setTripId(100);
        dto.setRatedUserId(2);
        dto.setScore(4);

        when(userRepository.findByEmail("driver@test.com")).thenReturn(Optional.of(driver));
        when(userRepository.findById(2)).thenReturn(Optional.of(passenger));
        when(tripRepository.findById(100)).thenReturn(Optional.of(trip));

        Booking validBooking = Booking.builder().user(passenger).trip(trip).status(BookingStatus.LEFT).build();
        when(bookingRepository.findByTripAndUser(trip, passenger)).thenReturn(Optional.of(validBooking));

        // ACT
        ratingService.submitRating(dto);

        // ASSERT
        verify(ratingRepository).save(ratingCaptor.capture());
        Rating savedRating = ratingCaptor.getValue();

        assertThat(savedRating.getRater()).isEqualTo(driver);
        assertThat(savedRating.getRatedUser()).isEqualTo(passenger);
        assertThat(savedRating.getIsDriverRating()).isFalse();
    }


    // FLAW CASES

    @Test
    void submitRating_ShouldThrowException_WhenRatingSelf() {
        // ARRANGE
        mockSecurityContext("driver@test.com");
        RatingRequestDTO dto = new RatingRequestDTO();
        dto.setRatedUserId(1);

        when(userRepository.findByEmail("driver@test.com")).thenReturn(Optional.of(driver));
        when(userRepository.findById(1)).thenReturn(Optional.of(driver));

        // ACT & ASSERT
        RuntimeException ex = assertThrows(RuntimeException.class, () -> ratingService.submitRating(dto));
        assertThat(ex.getMessage()).isEqualTo("You cannot rate yourself.");
    }

    @Test
    void submitRating_ShouldThrowException_WhenPassengerRatesAnotherPassenger() {
        // ARRANGE
        mockSecurityContext("passenger@test.com");
        RatingRequestDTO dto = new RatingRequestDTO();
        dto.setTripId(100);
        dto.setRatedUserId(3);

        when(userRepository.findByEmail("passenger@test.com")).thenReturn(Optional.of(passenger));
        when(userRepository.findById(3)).thenReturn(Optional.of(otherPassenger));
        when(tripRepository.findById(100)).thenReturn(Optional.of(trip));

        Booking validBooking = Booking.builder().status(BookingStatus.JOINED).build();
        when(bookingRepository.findByTripAndUser(trip, passenger)).thenReturn(Optional.of(validBooking));

        // ACT & ASSERT
        RuntimeException ex = assertThrows(RuntimeException.class, () -> ratingService.submitRating(dto));
        assertThat(ex.getMessage()).isEqualTo("You can only rate the driver.");
    }

    @Test
    void submitRating_ShouldThrowException_WhenRaterWasNotOnTrip() {
        // ARRANGE
        mockSecurityContext("passenger@test.com");
        RatingRequestDTO dto = new RatingRequestDTO();
        dto.setTripId(100);
        dto.setRatedUserId(1);

        when(userRepository.findByEmail("passenger@test.com")).thenReturn(Optional.of(passenger));
        when(userRepository.findById(1)).thenReturn(Optional.of(driver));
        when(tripRepository.findById(100)).thenReturn(Optional.of(trip));

        when(bookingRepository.findByTripAndUser(trip, passenger)).thenReturn(Optional.empty());

        // ACT & ASSERT
        RuntimeException ex = assertThrows(RuntimeException.class, () -> ratingService.submitRating(dto));
        assertThat(ex.getMessage()).isEqualTo("You were not a passenger on this trip.");
    }

    @Test
    void submitRating_ShouldThrowException_WhenDriverRatesNonPassenger() {
        // ARRANGE
        mockSecurityContext("driver@test.com");
        RatingRequestDTO dto = new RatingRequestDTO();
        dto.setTripId(100);
        dto.setRatedUserId(3);

        when(userRepository.findByEmail("driver@test.com")).thenReturn(Optional.of(driver));
        when(userRepository.findById(3)).thenReturn(Optional.of(otherPassenger));
        when(tripRepository.findById(100)).thenReturn(Optional.of(trip));

        when(bookingRepository.findByTripAndUser(trip, otherPassenger)).thenReturn(Optional.empty());

        // ACT & ASSERT
        RuntimeException ex = assertThrows(RuntimeException.class, () -> ratingService.submitRating(dto));
        assertThat(ex.getMessage()).isEqualTo("This user was not a passenger on your trip (or cancelled).");
    }

    // ADDITIONAL METHODS

    @Test
    void getUserAverage_ShouldCallRepositoryWithCorrectParams() {
        // ARRANGE
        when(userRepository.findById(1)).thenReturn(Optional.of(driver));
        when(ratingRepository.getAverageRating(driver, true)).thenReturn(4.5);

        // ACT
        Double avg = ratingService.getUserAverage(1, true);

        // ASSERT
        assertThat(avg).isEqualTo(4.5);
        verify(ratingRepository).getAverageRating(driver, true);
    }

    // HELPER METHOD
    private void mockSecurityContext(String email) {
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn(email);
        SecurityContextHolder.setContext(securityContext);
    }
}
