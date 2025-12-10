package com.vroommates.VroomMates.controller;

import com.vroommates.VroomMates.model.stats.HomeStatsDTO;
import com.vroommates.VroomMates.service.StatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
public class StatsController {

    private final StatsService statsService;

    @GetMapping("/home")
    public ResponseEntity<HomeStatsDTO> getHomeStats() {
        return ResponseEntity.ok(statsService.getHomePageStats());
    }
}