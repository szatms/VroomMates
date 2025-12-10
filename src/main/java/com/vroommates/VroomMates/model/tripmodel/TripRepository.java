package com.vroommates.VroomMates.model.tripmodel;

import com.vroommates.VroomMates.model.usermodel.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface TripRepository extends JpaRepository<Trip, Integer> {

    @Query("""
        SELECT t FROM Trip t
        WHERE t.isLive = true
          AND t.departureTime >= CURRENT_TIMESTAMP
          AND t.startLat BETWEEN :startLatMin AND :startLatMax
          AND t.startLon BETWEEN :startLonMin AND :startLonMax
          AND t.endLat BETWEEN :endLatMin AND :endLatMax
          AND t.endLon BETWEEN :endLonMin AND :endLonMax
    """)
    List<Trip> searchByBoundingBox(
            double startLatMin, double startLatMax,
            double startLonMin, double startLonMax,
            double endLatMin, double endLatMax,
            double endLonMin, double endLonMax
    );
    List<Trip> findAllByDriverAndIsLiveTrueOrderByDepartureTimeAsc(User driver);
    long countByIsLiveTrue();

    @Query("SELECT t FROM Trip t WHERE " +
            "t.isLive = true AND " +
            "t.departureTime > CURRENT_TIMESTAMP AND " +
            "ABS(t.startLat - :startLat) < 0.1 AND " + // kb 10km eltérés
            "ABS(t.startLon - :startLon) < 0.1 AND " +
            "ABS(t.endLat - :endLat) < 0.1 AND " +
            "ABS(t.endLon - :endLon) < 0.1")
    List<Trip> searchTrips(double startLat, double startLon, double endLat, double endLon);

    long countByIsLiveTrueAndDepartureTimeAfter(java.time.LocalDateTime now);
}
