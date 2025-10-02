package com.example.HDQCinema.entity;

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

    @ManyToOne
    @JoinColumn(name = "day_type",
            referencedColumnName = "day_type", // cột trong bảng day_type mà FK sẽ tham chiếu (không phải id).
            nullable = false)
    DayType dayType;
    @Enumerated(EnumType.STRING)
    SeatType seatType;
}
