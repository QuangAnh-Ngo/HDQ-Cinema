package com.example.HDQCinema.entity;

import com.example.HDQCinema.enums.DayType;
import com.example.HDQCinema.enums.SeatType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class TicketPrice {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    double price;
    @Enumerated(EnumType.STRING)
    DayType dayType;
    @Enumerated(EnumType.STRING)
    SeatType seatType;
}
