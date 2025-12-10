package com.vroommates.VroomMates.service;

import com.vroommates.VroomMates.model.ratingmodel.RatingRepository;
import com.vroommates.VroomMates.model.ratingmodel.dto.RatingResponseDTO;
import com.vroommates.VroomMates.model.stats.HomeStatsDTO;
import com.vroommates.VroomMates.model.tripmodel.TripRepository;
import com.vroommates.VroomMates.model.usermodel.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StatsService {

    private final UserRepository userRepository;
    private final TripRepository tripRepository;
    private final RatingRepository ratingRepository;

    public HomeStatsDTO getHomePageStats() {

        List<RatingResponseDTO> ratings = ratingRepository.findTop3ByCommentIsNotNullOrderByCreatedAtDesc()
                .stream()
                .map(r -> RatingResponseDTO.builder()
                        .raterName(r.getRater().getDisplayName()) // Vagy getUserName()
                        .raterPfp(r.getRater().getPfp())
                        .score(r.getScore())
                        .comment(r.getComment())
                        .build())
                .toList();

        return HomeStatsDTO.builder()
                .totalDrivers(userRepository.countByIsDriverTrue())
                .totalPassengers(userRepository.count())
                .activeTrips(tripRepository.countByIsLiveTrue())
                .latestRatings(ratings)
                .activeTrips(tripRepository.countByIsLiveTrueAndDepartureTimeAfter(java.time.LocalDateTime.now()))
                .build();
    }
}