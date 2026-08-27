package com.kothareddypalem.backend.repository;

import com.kothareddypalem.backend.entity.Donor;
import com.kothareddypalem.backend.entity.Festival;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface DonorRepository extends JpaRepository<Donor, Long> {

    List<Donor> findAllByFestivalOrderByCreatedAtDesc(Festival festival);
    Optional<Donor> findByIdAndFestival(Long id, Festival festival);
    long countByFestival(Festival festival);

    @Query("""
            SELECT COALESCE(SUM(d.amount), 0)
            FROM Donor d
            WHERE d.festival = :festival
            """)
    BigDecimal getTotalIncome(@Param("festival") Festival festival
    );
}