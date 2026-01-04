package com.example.HDQCinema.dto.response;

import com.example.HDQCinema.dto.request.ShowTimeAndRoom;
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
    String showtimeId;
    String movieId;
    List<ShowTimeAndRoom> showTimeRooms;
}
