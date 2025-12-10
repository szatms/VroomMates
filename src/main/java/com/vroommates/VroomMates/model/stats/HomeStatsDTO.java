package com.vroommates.VroomMates.model.stats;

import com.vroommates.VroomMates.model.ratingmodel.dto.RatingResponseDTO;
import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class HomeStatsDTO {
    private long totalDrivers;
    private long totalPassengers;
    private long activeTrips;

    private List<RatingResponseDTO> latestRatings;
}