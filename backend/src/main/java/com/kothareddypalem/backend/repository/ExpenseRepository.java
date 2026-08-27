package com.kothareddypalem.backend.repository;

import com.kothareddypalem.backend.entity.Expense;
import com.kothareddypalem.backend.entity.Festival;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {


    List<Expense> findAllByFestivalOrderByCreatedAtDesc(Festival festival);
    Optional<Expense> findByIdAndFestival(Long id, Festival festival);
    long countByFestival(Festival festival);

    @Query("""
            SELECT COALESCE(SUM(e.amount), 0)
            FROM Expense e
            WHERE e.festival = :festival
            """)
    BigDecimal getTotalExpense(@Param("festival") Festival festival);
}