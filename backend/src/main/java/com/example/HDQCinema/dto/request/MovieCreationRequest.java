package com.example.HDQCinema.dto.request;

import com.example.HDQCinema.entity.ShowTime;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MovieCreationRequest {
    String name, poster;
    Integer duration;
    Integer limitAge;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss") // format ISO 8601
    List<LocalDateTime> showTimes;
}
