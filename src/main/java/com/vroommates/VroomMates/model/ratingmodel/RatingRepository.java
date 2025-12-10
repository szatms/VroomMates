package com.vroommates.VroomMates.model.ratingmodel;

import com.vroommates.VroomMates.model.usermodel.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RatingRepository extends JpaRepository<Rating, Long> {

    // Lekéri egy adott user összes kapott értékelését (pl. a profiljához)
    List<Rating> findByRatedUser(User ratedUser);

    // Kiszámolja a user átlagát (pl. sofőrként)
    @Query("SELECT AVG(r.score) FROM Rating r WHERE r.ratedUser = :user AND r.isDriverRating = :isDriver")
    Double getAverageRating(@Param("user") User user, @Param("isDriver") boolean isDriver);
    List<Rating> findTop3ByCommentIsNotNullOrderByCreatedAtDesc();
}