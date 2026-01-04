package com.example.HDQCinema.dto.query;

import com.example.HDQCinema.enums.SeatStatus;
import com.example.HDQCinema.enums.SeatType;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SeatPerShowTimeDTO {
    double price;
    String seatId;
    String seatName;
    SeatType seatType;
    SeatStatus seatStatus;
}
