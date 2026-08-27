package com.kothareddypalem.backend.service;

import com.kothareddypalem.backend.dto.DashboardStatsResponse;
import com.kothareddypalem.backend.entity.Festival;
import com.kothareddypalem.backend.entity.User;
import com.kothareddypalem.backend.repository.DonorRepository;
import com.kothareddypalem.backend.repository.ExpenseRepository;
import com.kothareddypalem.backend.repository.FestivalRepository;
import com.kothareddypalem.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;
    private final FestivalRepository festivalRepository;
    private final DonorRepository donorRepository;
    private final ExpenseRepository expenseRepository;

    public DashboardStatsResponse getDashboardStats(String email, Long festivalId) {

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Festival festival = festivalRepository
                .findByIdAndUser(festivalId, user)
                .orElseThrow(() -> new RuntimeException("Festival not found"));

        BigDecimal totalIncome = donorRepository.getTotalIncome(festival);
        BigDecimal totalExpense = expenseRepository.getTotalExpense(festival);
        long donors = donorRepository.countByFestival(festival);
        long expenseEntries = expenseRepository.countByFestival(festival);
        BigDecimal netBalance = totalIncome.subtract(totalExpense);
        BigDecimal fundHealth = calculateFundHealth(totalIncome, totalExpense);

        return DashboardStatsResponse.builder()
                .netBalance(netBalance)
                .totalIncome(totalIncome)
                .totalExpense(totalExpense)
                .donors(donors)
                .expenseEntries(expenseEntries)
                .fundHealth(fundHealth)
                .build();
    }

    private BigDecimal calculateFundHealth(BigDecimal totalIncome, BigDecimal totalExpense) {

        if (totalIncome.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }

        BigDecimal remaining = totalIncome.subtract(totalExpense);
        BigDecimal percentage = remaining
                .divide(totalIncome, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));

        return percentage.max(BigDecimal.ZERO);
    }
}