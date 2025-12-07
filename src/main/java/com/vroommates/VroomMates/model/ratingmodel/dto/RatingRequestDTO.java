package com.vroommates.VroomMates.model.ratingmodel.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RatingRequestDTO {

    @NotNull
    private Integer tripId;

    @NotNull
    private Integer ratedUserId;

    @NotNull
    @Min(1)
    @Max(5)
    private Integer score;

    private String comment;
}