package com.kothareddypalem.backend.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Builder
public class ReportResponse {

    private Long festivalId;
    private String festivalName;
    private Integer festivalYear;
    private String festivalLocation;
    private Integer totalDonors;
    private BigDecimal totalIncome;
    private Integer totalExpenses;
    private BigDecimal totalExpenseAmount;
    private BigDecimal balance;
    private List<DonorResponse> donors;
    private List<ExpenseResponse> expenses;
}