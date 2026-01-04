package com.example.HDQCinema.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class MovieUpdateRequest {
    String title, poster;
    Integer duration;
    Integer limitAge;
    LocalDate dayStart, dayEnd;
    String director, genre, description, trailer_url;
}
