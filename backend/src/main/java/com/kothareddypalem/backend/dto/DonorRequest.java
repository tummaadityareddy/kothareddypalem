package com.kothareddypalem.backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DonorRequest {

    @NotBlank(message = "Donor name is required")
    private String name;

    @NotNull(message = "Amount is required")
    @DecimalMin(
            value = "0.01",
            message = "Amount must be greater than zero"
    )
    private BigDecimal amount;

    private String phone;

    private String address;

    @NotBlank(message = "Payment mode is required")
    private String paymentMode;

    @NotNull(message = "Donation date is required")
    private LocalDate donationDate;

    private String notes;
}