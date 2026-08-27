package com.kothareddypalem.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FestivalRequest {

    @NotBlank(message = "Festival name is required")
    private String name;

    @NotNull(message = "Year is required")
    @Min(value = 2000, message = "Invalid year")
    @Max(value = 2100, message = "Invalid year")
    private Integer year;

    private String location;
    private String description;
    private String status;
}