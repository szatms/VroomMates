package com.vroommates.VroomMates.service;

import com.vroommates.VroomMates.model.ratingmodel.RatingRepository;
import com.vroommates.VroomMates.model.ratingmodel.dto.RatingResponseDTO;
import com.vroommates.VroomMates.model.stats.HomeStatsDTO;
import com.vroommates.VroomMates.model.tripmodel.Trip;
import com.vroommates.VroomMates.model.tripmodel.TripRepository;
import com.vroommates.VroomMates.model.tripmodel.dto.TripResponseDTO;
import com.vroommates.VroomMates.model.tripmodel.mapper.TripMapper;
import com.vroommates.VroomMates.model.usermodel.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StatsService {

    private final UserRepository userRepository;
    private final TripRepository tripRepository;
    private final RatingRepository ratingRepository;
    private final TripMapper tripMapper;

    public HomeStatsDTO getHomePageStats() {
        LocalDateTime now = LocalDateTime.now();

        // Legközelebbi út lekérése
        Trip nextTripEntity = tripRepository.findFirstByIsLiveTrueAndDepartureTimeAfterOrderByDepartureTimeAsc(now);
        TripResponseDTO nextTripDTO = (nextTripEntity != null) ? tripMapper.toDTO(nextTripEntity) : null;

        // Ha van nextTrip, tegyük bele a location neveket is (ha a mapper alapból nem tenné)
        if (nextTripEntity != null && nextTripDTO != null) {
            nextTripDTO.setStartLocation(nextTripEntity.getStartLocation());
            nextTripDTO.setEndLocation(nextTripEntity.getEndLocation());
        }

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
                .nextTrip(nextTripDTO)
                .latestRatings(ratings)
                .activeTrips(tripRepository.countByIsLiveTrueAndDepartureTimeAfter(java.time.LocalDateTime.now()))
                .build();
    }
}