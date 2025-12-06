package com.vroommates.VroomMates.model.bookingmodel;

import com.vroommates.VroomMates.model.bookingmodel.BookingStatus;
import com.vroommates.VroomMates.model.tripmodel.Trip;
import com.vroommates.VroomMates.model.usermodel.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByTripAndStatus(Trip trip, BookingStatus status);

    int countByTripAndStatus(Trip trip, BookingStatus status);

    Optional<Booking> findByTripAndUser(Trip trip, User user);
}
