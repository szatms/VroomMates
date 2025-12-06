package com.vroommates.VroomMates.model.bookingmodel;

import com.vroommates.VroomMates.model.tripmodel.Trip;
import com.vroommates.VroomMates.model.usermodel.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Booking {

    @Id
    @GeneratedValue
    private Long bookingID;

    @ManyToOne
    @JoinColumn(name = "trip_id")
    private Trip trip;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    private BookingStatus status;

    private LocalDateTime joinedAt;
    private LocalDateTime leftAt;
}
