package com.example.HDQCinema.entity;

import com.example.HDQCinema.enums.SeatStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class BookingSeat {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "bookingseat_id")
    String id;

    @Enumerated(EnumType.STRING)
    SeatStatus seatStatus;

    LocalDateTime holdTime;
    double price;

    @ManyToOne
    @JoinColumn(name = "seat_id", nullable = false)
    Seat seat;

    @ManyToOne
    @JoinColumn(name = "showtime_id", nullable = false)
    ShowTime showTime;

}
