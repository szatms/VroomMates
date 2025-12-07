package com.vroommates.VroomMates.service;

import com.vroommates.VroomMates.model.bookingmodel.BookingRepository;
import com.vroommates.VroomMates.model.bookingmodel.BookingStatus;
import com.vroommates.VroomMates.model.ratingmodel.Rating;
import com.vroommates.VroomMates.model.ratingmodel.RatingRepository;
import com.vroommates.VroomMates.model.ratingmodel.dto.RatingRequestDTO;
import com.vroommates.VroomMates.model.tripmodel.Trip;
import com.vroommates.VroomMates.model.tripmodel.TripRepository;
import com.vroommates.VroomMates.model.usermodel.User;
import com.vroommates.VroomMates.model.usermodel.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class RatingService {

    private final RatingRepository ratingRepository;
    private final UserRepository userRepository;
    private final TripRepository tripRepository;
    private final BookingRepository bookingRepository;

    public void submitRating(RatingRequestDTO dto) {

        String raterEmail = Objects.requireNonNull(SecurityContextHolder.getContext().getAuthentication()).getName();
        User rater = userRepository.findByEmail(raterEmail)
                .orElseThrow(() -> new RuntimeException("Rater user not found"));

        User ratedUser = userRepository.findById(dto.getRatedUserId())
                .orElseThrow(() -> new RuntimeException("Target user not found"));

        if (rater.getUserId().equals(ratedUser.getUserId())) {
            throw new RuntimeException("You cannot rate yourself.");
        }

        Trip trip = tripRepository.findById(dto.getTripId())
                .orElseThrow(() -> new RuntimeException("Trip not found"));

        // utaztak együtt?
        boolean raterIsDriver = trip.getDriver().equals(rater);
        boolean ratedIsDriver = trip.getDriver().equals(ratedUser);

        if (raterIsDriver) {
            boolean isPassenger = bookingRepository.findByTripAndUser(trip, ratedUser)
                    .map(b -> b.getStatus() == BookingStatus.JOINED || b.getStatus() == BookingStatus.LEFT)
                    .orElse(false);

            if (!isPassenger) {
                throw new RuntimeException("This user was not a passenger on your trip (or cancelled).");
            }
        }
        else {
            boolean raterWasPassenger = bookingRepository.findByTripAndUser(trip, rater)
                    .map(b -> b.getStatus() == BookingStatus.JOINED || b.getStatus() == BookingStatus.LEFT)
                    .orElse(false);

            if (!raterWasPassenger) {
                throw new RuntimeException("You were not a passenger on this trip.");
            }

            if (!ratedIsDriver) {
                throw new RuntimeException("You can only rate the driver.");
            }
        }

        Rating rating = Rating.builder()
                .rater(rater)
                .ratedUser(ratedUser)
                .trip(trip)
                .score(dto.getScore())
                .comment(dto.getComment())
                .isDriverRating(ratedIsDriver)
                .createdAt(LocalDateTime.now())
                .build();

        ratingRepository.save(rating);
    }

    public List<Rating> getUserRatings(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ratingRepository.findByRatedUser(user);
    }

    public Double getUserAverage(Integer userId, boolean asDriver) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ratingRepository.getAverageRating(user, asDriver);
    }
}