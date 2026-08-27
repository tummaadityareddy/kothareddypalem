package com.kothareddypalem.backend.controller;

import com.kothareddypalem.backend.dto.ReportResponse;
import com.kothareddypalem.backend.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/festivals/{festivalId}/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping
    public ResponseEntity<ReportResponse> getFestivalReport(@PathVariable Long festivalId, Authentication authentication) {

        String email = authentication.getName();
        return ResponseEntity.ok(reportService.getFestivalReport(email, festivalId));
    }
}