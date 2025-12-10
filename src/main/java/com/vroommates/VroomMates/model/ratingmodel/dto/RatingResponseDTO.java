package com.vroommates.VroomMates.model.ratingmodel.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RatingResponseDTO {
    private String raterName; // Aki írta
    private String raterPfp;  // Profilképe (ha van)
    private int score;
    private String comment;
}