package com.kothareddypalem.backend.controller;

import com.kothareddypalem.backend.dto.FestivalRequest;
import com.kothareddypalem.backend.dto.FestivalResponse;
import com.kothareddypalem.backend.service.FestivalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/festivals")
@RequiredArgsConstructor
public class FestivalController {

    private final FestivalService festivalService;

    @GetMapping
    public ResponseEntity<List<FestivalResponse>> getMyFestivals(Authentication authentication) {

        String email = authentication.getName();
        return ResponseEntity.ok(festivalService.getMyFestivals(email));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FestivalResponse> getFestival(@PathVariable Long id, Authentication authentication) {

        String email = authentication.getName();
        return ResponseEntity.ok(festivalService.getFestival(email, id));
    }

    @PostMapping
    public ResponseEntity<FestivalResponse> createFestival(@Valid @RequestBody FestivalRequest request, Authentication authentication) {

        String email = authentication.getName();
        FestivalResponse response = festivalService.createFestival(email, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}