package com.kothareddypalem.backend.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FestivalResponse {

    private Long id;
    private String name;
    private Integer year;
    private String location;
    private String status;
    private String description;
    private LocalDateTime createdAt;
}