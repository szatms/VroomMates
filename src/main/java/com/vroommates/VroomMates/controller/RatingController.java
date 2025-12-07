package com.vroommates.VroomMates.controller;

import com.vroommates.VroomMates.model.ratingmodel.Rating;
import com.vroommates.VroomMates.model.ratingmodel.dto.RatingRequestDTO;
import com.vroommates.VroomMates.service.RatingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ratings")
@RequiredArgsConstructor
public class RatingController {

    private final RatingService ratingService;

    @PostMapping
    public ResponseEntity<String> submitRating(@RequestBody RatingRequestDTO dto) {
        ratingService.submitRating(dto);
        return ResponseEntity.ok("Rating submitted successfully.");
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Rating>> getUserRatings(@PathVariable Integer userId) {
        return ResponseEntity.ok(ratingService.getUserRatings(userId));
    }

    @GetMapping("/average/{userId}")
    public ResponseEntity<Double> getUserAverage(
            @PathVariable Integer userId,
            @RequestParam(defaultValue = "true") boolean asDriver
    ) {
        return ResponseEntity.ok(ratingService.getUserAverage(userId, asDriver));
    }
}