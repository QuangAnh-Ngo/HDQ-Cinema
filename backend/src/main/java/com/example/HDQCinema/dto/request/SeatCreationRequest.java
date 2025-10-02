package com.example.HDQCinema.dto.request;

import com.example.HDQCinema.enums.SeatType;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class SeatCreationRequest {
    int firstColumnSeatNumber;
    int lastColumnSeatNumber;
    Character firstSeatRow;
    Character lastSeatRow;
    String roomId;
    String type;
}
