package com.vroommates.VroomMates.model.stats;

import com.vroommates.VroomMates.model.ratingmodel.dto.RatingResponseDTO;
import com.vroommates.VroomMates.model.tripmodel.dto.TripResponseDTO;
import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class HomeStatsDTO {
    private long totalDrivers;
    private long totalPassengers;
    private long activeTrips;
    private TripResponseDTO nextTrip;

    private List<RatingResponseDTO> latestRatings;
}