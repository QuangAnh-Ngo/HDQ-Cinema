package com.example.HDQCinema.dto.response;

import com.example.HDQCinema.enums.SeatStatus;
import com.example.HDQCinema.enums.SeatType;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class SeatPerShowTimeResponse {
    String seatId;
    String seatName;
    SeatType seatType;
    SeatStatus seatStatus;
}
