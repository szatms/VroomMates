package com.vroommates.VroomMates.model.ratingmodel;

import com.vroommates.VroomMates.model.tripmodel.Trip;
import com.vroommates.VroomMates.model.usermodel.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Rating {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long ratingId;

    @ManyToOne
    @JoinColumn(name = "rater_user_id", nullable = false)
    private User rater;

    @ManyToOne
    @JoinColumn(name = "rated_user_id", nullable = false)
    private User ratedUser;

    @ManyToOne
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;

    @Column(nullable = false)
    private Integer score; // 1-5 skála

    private String comment;

    // TRUE = Sofőrt értékelték, FALSE = Utast értékelték
    private Boolean isDriverRating;

    private LocalDateTime createdAt;
}