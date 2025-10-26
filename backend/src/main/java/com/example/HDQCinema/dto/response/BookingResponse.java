package com.example.HDQCinema.dto.response;

import com.example.HDQCinema.entity.Seat;
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
public class BookingResponse {
    String id;
    double totalPrice;
    LocalDateTime createTime;
    String username;
    LocalDateTime showTime;
    List<String> seats;
}
