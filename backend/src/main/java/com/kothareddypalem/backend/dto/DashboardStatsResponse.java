package com.kothareddypalem.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {

    private BigDecimal netBalance;
    private BigDecimal totalIncome;
    private BigDecimal totalExpense;
    private long donors;
    private long expenseEntries;
    private BigDecimal fundHealth;
}