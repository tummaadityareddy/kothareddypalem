package com.kothareddypalem.backend.service;

import com.kothareddypalem.backend.dto.DonorRequest;
import com.kothareddypalem.backend.dto.DonorResponse;
import com.kothareddypalem.backend.entity.Donor;
import com.kothareddypalem.backend.entity.Festival;
import com.kothareddypalem.backend.entity.User;
import com.kothareddypalem.backend.repository.DonorRepository;
import com.kothareddypalem.backend.repository.FestivalRepository;
import com.kothareddypalem.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DonorService {

    private final DonorRepository donorRepository;
    private final FestivalRepository festivalRepository;
    private final UserRepository userRepository;

    public List<DonorResponse> getMyDonors(String email, Long festivalId) {

        User user = getUser(email);
        Festival festival = getFestival(festivalId, user);
        return donorRepository
                .findAllByFestivalOrderByCreatedAtDesc(festival)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public DonorResponse createDonor(String email, Long festivalId, DonorRequest request) {

        User user = getUser(email);
        Festival festival = getFestival(festivalId, user);

        Donor donor = Donor.builder()
                .name(request.getName())
                .amount(request.getAmount())
                .phone(request.getPhone())
                .address(request.getAddress())
                .paymentMode(request.getPaymentMode())
                .donationDate(request.getDonationDate())
                .notes(request.getNotes())
                .festival(festival)
                .build();
        Donor savedDonor = donorRepository.save(donor);
        return toResponse(savedDonor);
    }

    public DonorResponse getDonor(String email, Long festivalId, Long donorId) {

        User user = getUser(email);
        Festival festival = getFestival(festivalId, user);

        Donor donor = donorRepository
                .findByIdAndFestival(donorId, festival)
                .orElseThrow(() -> new RuntimeException("Donor not found"));
        return toResponse(donor);
    }

    private User getUser(String email) {
        return userRepository
                .findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private Festival getFestival(Long festivalId, User user) {

        return festivalRepository
                .findByIdAndUser(festivalId, user)
                .orElseThrow(() -> new RuntimeException("Festival not found"));
    }

    private DonorResponse toResponse(Donor donor) {

        return DonorResponse.builder()
                .id(donor.getId())
                .name(donor.getName())
                .amount(donor.getAmount())
                .phone(donor.getPhone())
                .address(donor.getAddress())
                .paymentMode(donor.getPaymentMode())
                .donationDate(donor.getDonationDate())
                .notes(donor.getNotes())
                .createdAt(donor.getCreatedAt())
                .festivalId(donor.getFestival().getId())
                .build();
    }
}