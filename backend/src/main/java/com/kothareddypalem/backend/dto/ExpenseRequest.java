package com.kothareddypalem.backend.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExpenseRequest {

    private String category;
    private BigDecimal amount;
    private String description;
    private LocalDate expenseDate;
}