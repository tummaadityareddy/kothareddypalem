package com.kothareddypalem.backend.service;

import com.kothareddypalem.backend.dto.ExpenseRequest;
import com.kothareddypalem.backend.dto.ExpenseResponse;
import com.kothareddypalem.backend.entity.Expense;
import com.kothareddypalem.backend.entity.Festival;
import com.kothareddypalem.backend.entity.User;
import com.kothareddypalem.backend.repository.ExpenseRepository;
import com.kothareddypalem.backend.repository.FestivalRepository;
import com.kothareddypalem.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final FestivalRepository festivalRepository;
    private final UserRepository userRepository;

    public List<ExpenseResponse> getExpenses(String email, Long festivalId) {

        User user = getUser(email);
        Festival festival = getFestival(festivalId, user);

        return expenseRepository
                .findAllByFestivalOrderByCreatedAtDesc(festival)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public ExpenseResponse createExpense(String email, Long festivalId, ExpenseRequest request) {

        User user = getUser(email);
        Festival festival = getFestival(festivalId, user);

        Expense expense = Expense.builder()
                .category(request.getCategory())
                .amount(request.getAmount())
                .description(request.getDescription())
                .expenseDate(request.getExpenseDate())
                .festival(festival)
                .build();

        Expense savedExpense = expenseRepository.save(expense);
        return toResponse(savedExpense);
    }

    public ExpenseResponse getExpense(String email, Long festivalId, Long expenseId) {

        User user = getUser(email);
        Festival festival = getFestival(festivalId, user);

        Expense expense = expenseRepository
                .findByIdAndFestival(expenseId, festival)
                .orElseThrow(() -> new RuntimeException("Expense not found"));
        return toResponse(expense);
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

    private ExpenseResponse toResponse(Expense expense) {
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