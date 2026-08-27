package com.kothareddypalem.backend.service;

import com.kothareddypalem.backend.dto.DonorResponse;
import com.kothareddypalem.backend.dto.ExpenseResponse;
import com.kothareddypalem.backend.dto.ReportResponse;
import com.kothareddypalem.backend.entity.Donor;
import com.kothareddypalem.backend.entity.Expense;
import com.kothareddypalem.backend.entity.Festival;
import com.kothareddypalem.backend.entity.User;
import com.kothareddypalem.backend.repository.DonorRepository;
import com.kothareddypalem.backend.repository.ExpenseRepository;
import com.kothareddypalem.backend.repository.FestivalRepository;
import com.kothareddypalem.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final DonorRepository donorRepository;
    private final ExpenseRepository expenseRepository;
    private final FestivalRepository festivalRepository;
    private final UserRepository userRepository;

    public ReportResponse getFestivalReport(String email, Long festivalId) {

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Festival festival = festivalRepository
                .findByIdAndUser(festivalId, user)
                .orElseThrow(() -> new RuntimeException("Festival not found"));

        List<Donor> donors = donorRepository
                .findAllByFestivalOrderByCreatedAtDesc(festival);

        List<Expense> expenses = expenseRepository
                .findAllByFestivalOrderByCreatedAtDesc(festival);

        List<DonorResponse> donorResponses = donors.stream()
                .map(this::toDonorResponse)
                .toList();

        List<ExpenseResponse> expenseResponses = expenses.stream()
                .map(this::toExpenseResponse)
                .toList();

        BigDecimal totalIncome = donors.stream()
                .map(Donor::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalExpenseAmount = expenses.stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal balance = totalIncome.subtract(totalExpenseAmount);

        return ReportResponse.builder()
                .festivalId(festival.getId())
                .festivalName(festival.getName())
                .festivalYear(festival.getYear())
                .festivalLocation(festival.getLocation())
                .totalDonors(donors.size())
                .totalIncome(totalIncome)
                .totalExpenses(expenses.size())
                .totalExpenseAmount(totalExpenseAmount)
                .balance(balance)
                .donors(donorResponses)
                .expenses(expenseResponses)
                .build();
    }

    private DonorResponse toDonorResponse(Donor donor) {

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

    private ExpenseResponse toExpenseResponse(Expense expense) {

        return ExpenseResponse.builder()
                .id(expense.getId())
                .category(expense.getCategory())
                .amount(expense.getAmount())
                .description(expense.getDescription())
                .expenseDate(expense.getExpenseDate())
                .createdAt(expense.getCreatedAt())
                .festivalId(expense.getFestival().getId())
                .build();
    }
}