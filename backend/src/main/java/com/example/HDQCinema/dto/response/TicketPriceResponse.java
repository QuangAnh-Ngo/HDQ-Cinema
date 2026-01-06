package com.example.HDQCinema.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class TicketPriceResponse {
    Long id;
    double price;
    Long cinemaId;
    String dayType;
    String seatType;
}
