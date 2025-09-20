package com.example.HDQCinema.entity;

import com.example.HDQCinema.enums.SeatType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Seat {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "seat_id")
    String id;

    int seatNumber;
    String seatRow;
    SeatType seatType;

    @ManyToOne
    @JoinColumn(name = "room_id", nullable = false)
    Room room;

    @ManyToOne
    @JoinColumn(name = "booking_id", nullable = false)
    Booking booking;
}
