package com.example.HDQCinema.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class TicketPriceUpdateRequest {
    double price;
    @NonNull
    String cinemaId;
    String dayType;
    String seatType;
}
