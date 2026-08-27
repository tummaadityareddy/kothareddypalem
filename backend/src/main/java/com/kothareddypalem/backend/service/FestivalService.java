package com.kothareddypalem.backend.service;

import com.kothareddypalem.backend.dto.FestivalRequest;
import com.kothareddypalem.backend.dto.FestivalResponse;
import com.kothareddypalem.backend.entity.Festival;
import com.kothareddypalem.backend.entity.User;
import com.kothareddypalem.backend.repository.FestivalRepository;
import com.kothareddypalem.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FestivalService {

    private final FestivalRepository festivalRepository;
    private final UserRepository userRepository;

    public List<FestivalResponse> getMyFestivals(String email) {

        User user = getUser(email);
        return festivalRepository
                .findAllByUserOrderByYearDesc(user)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public FestivalResponse createFestival(String email, FestivalRequest request) {

        User user = getUser(email);
        boolean exists = festivalRepository
                .existsByNameAndYearAndUser(request.getName(), request.getYear(), user);

        if (exists) {
            throw new RuntimeException(
                    "Festival already exists for this year"
            );
        }

        Festival festival = Festival.builder()
                .name(request.getName())
                .year(request.getYear())
                .location(request.getLocation())
                .description(request.getDescription())
                .status(request.getStatus() == null || request.getStatus().isBlank() ? "ACTIVE" : request.getStatus())
                .user(user)
                .build();

        Festival savedFestival = festivalRepository.save(festival);
        return toResponse(savedFestival);
    }

    public FestivalResponse getFestival(String email, Long festivalId) {

        User user = getUser(email);
        Festival festival = festivalRepository
                .findByIdAndUser(festivalId, user)
                .orElseThrow(() -> new RuntimeException("Festival not found"));

        return toResponse(festival);
    }

    private User getUser(String email) {

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private FestivalResponse toResponse(Festival festival) {

        return FestivalResponse.builder()
                .id(festival.getId())
                .name(festival.getName())
                .year(festival.getYear())
                .location(festival.getLocation())
                .description(festival.getDescription())
                .status(festival.getStatus())
                .createdAt(festival.getCreatedAt())
                .build();
    }
}