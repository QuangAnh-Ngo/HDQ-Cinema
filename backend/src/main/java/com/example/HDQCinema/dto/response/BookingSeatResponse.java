package com.example.HDQCinema.dto.response;

import com.example.HDQCinema.entity.Seat;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class BookingSeatResponse {
    double price;
    String seat;
}
