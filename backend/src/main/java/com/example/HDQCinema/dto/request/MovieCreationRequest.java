package com.example.HDQCinema.dto.request;

import com.example.HDQCinema.entity.ShowTime;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MovieCreationRequest {
    String title, poster;
    Integer duration;
    Integer limitAge;
    LocalDate dayStart, dayEnd;
    String director, genre, description, trailer_url;
}
