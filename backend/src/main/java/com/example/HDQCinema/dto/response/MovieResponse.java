package com.example.HDQCinema.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class MovieResponse {
    Long id;
    String title, poster;
    Integer duration;
    Integer limitAge;
    LocalDate dayStart, dayEnd;
    String director, genre, description, trailer_url;
    List<ShowTimeResponse> showtimes;  // Danh sách suất chiếu với đầy đủ ID
}
