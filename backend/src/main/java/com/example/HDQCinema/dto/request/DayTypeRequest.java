package com.example.HDQCinema.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class DayTypeRequest {
    String dayType;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dayStart;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dayEnd;
}
