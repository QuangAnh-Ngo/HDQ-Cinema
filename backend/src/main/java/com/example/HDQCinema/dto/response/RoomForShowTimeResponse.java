package com.example.HDQCinema.dto.response;

import com.example.HDQCinema.dto.query.SeatPerShowTimeDTO;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class RoomForShowTimeResponse {
    Long roomId;
    Long showtimeId;
    String roomName;
    String cinemaName;
    List<SeatPerShowTimeDTO> seats;
}
