package com.kothareddypalem.backend.controller;

import com.kothareddypalem.backend.dto.ExpenseRequest;
import com.kothareddypalem.backend.dto.ExpenseResponse;
import com.kothareddypalem.backend.service.ExpenseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/festivals/{festivalId}/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    @GetMapping
    public ResponseEntity<List<ExpenseResponse>> getExpenses(@PathVariable Long festivalId, Authentication authentication) {

        return ResponseEntity.ok(expenseService.getExpenses(authentication.getName(), festivalId));
    }

    @PostMapping
    public ResponseEntity<ExpenseResponse> createExpense(@PathVariable Long festivalId, @RequestBody ExpenseRequest request, Authentication authentication) {

        return ResponseEntity.status(HttpStatus.CREATED).body(expenseService.createExpense(authentication.getName(), festivalId, request));
    }
}