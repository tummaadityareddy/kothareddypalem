package com.kothareddypalem.backend.controller;

import com.kothareddypalem.backend.dto.DonorRequest;
import com.kothareddypalem.backend.dto.DonorResponse;
import com.kothareddypalem.backend.service.DonorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/festivals/{festivalId}/donors")
@RequiredArgsConstructor
public class DonorController {

    private final DonorService donorService;

    @GetMapping
    public ResponseEntity<List<DonorResponse>> getMyDonors(@PathVariable Long festivalId, Authentication authentication) {

        String email = authentication.getName();
        return ResponseEntity.ok(donorService.getMyDonors(email, festivalId));
    }

    @GetMapping("/{donorId}")
    public ResponseEntity<DonorResponse> getDonor(@PathVariable Long festivalId, @PathVariable Long donorId, Authentication authentication) {

        String email = authentication.getName();
        return ResponseEntity.ok(donorService.getDonor(email, festivalId, donorId));
    }

    @PostMapping
    public ResponseEntity<DonorResponse> createDonor(@PathVariable Long festivalId, @Valid @RequestBody DonorRequest request, Authentication authentication) {
        String email = authentication.getName();
        DonorResponse response = donorService.createDonor(email, festivalId, request);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}