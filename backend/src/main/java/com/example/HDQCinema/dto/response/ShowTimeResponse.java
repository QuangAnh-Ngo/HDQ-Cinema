package com.example.HDQCinema.dto.response;

import com.example.HDQCinema.entity.ShowTime;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class ShowTimeResponse {
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss") // format ISO 8601
    List<ShowTime> startTime;
}
