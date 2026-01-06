package com.example.HDQCinema.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BookingRequest {
    String memberId;
    Long showTimeId;
    Long cinemaId;
    List<BookingDetailRequest> bookingDetailRequests;
}
