package com.kothareddypalem.backend.controller;

import com.kothareddypalem.backend.dto.DashboardStatsResponse;
import com.kothareddypalem.backend.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/festivals/{festivalId}/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats(@PathVariable Long festivalId, Authentication authentication) {

        return ResponseEntity.ok(dashboardService.getDashboardStats(authentication.getName(), festivalId));
    }
}