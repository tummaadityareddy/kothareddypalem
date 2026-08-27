package com.kothareddypalem.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DonorResponse {

    private Long id;
    private String name;
    private BigDecimal amount;
    private String phone;
    private String address;
    private String paymentMode;
    private LocalDate donationDate;
    private String notes;
    private LocalDateTime createdAt;
    private Long festivalId;
}