package com.example.HDQCinema.dto.request;

import com.example.HDQCinema.dto.response.RoomResponse;
import com.example.HDQCinema.dto.response.ShowTimeResponse;
import com.example.HDQCinema.entity.Room;
import com.example.HDQCinema.entity.ShowTime;
import com.example.HDQCinema.repository.ShowTimeRepository;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class ShowTimeAndRoom {
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss") // format ISO 8601
    LocalDateTime showTime;
    String roomId;
}
