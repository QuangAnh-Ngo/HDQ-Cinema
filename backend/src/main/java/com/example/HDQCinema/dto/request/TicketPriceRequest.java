package com.example.HDQCinema.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.antlr.v4.runtime.misc.NotNull;
import org.hibernate.annotations.SecondaryRow;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class TicketPriceRequest {
    double price;
    @NonNull
    String cinemaId;
    String dayType;
    String seatType;
}
