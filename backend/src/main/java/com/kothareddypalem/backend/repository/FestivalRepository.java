package com.kothareddypalem.backend.repository;

import com.kothareddypalem.backend.entity.Festival;
import com.kothareddypalem.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FestivalRepository extends JpaRepository<Festival, Long> {

    List<Festival> findAllByUserOrderByYearDesc(User user);
    Optional<Festival> findByIdAndUser(Long id, User user);
    boolean existsByNameAndYearAndUser(String name, Integer year, User user);
}