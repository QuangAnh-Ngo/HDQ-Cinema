package com.example.HDQCinema.dto.response;

import com.example.HDQCinema.entity.ShowTime;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class MovieResponse {
    String id;
    String name, poster;
    Integer duration;
    Integer limitAge;
    Set<ShowTime> showtimes;
}
