package com.example.HDQCinema.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BookingDetail {
    // để seat ko cần bắt buộc phải có booking nữa
    //Seat chỉ biết nó thuộc về Room
    //Việc ghế có được đặt hay không sẽ do BookingSeat quyết định.

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    double price;

    @ManyToOne
    @JoinColumn(name = "seat_id", nullable = false, unique = true)
    private Seat seat;

    @ManyToOne
    @JoinColumn(name = "booking_id", nullable = false, unique = true)
    private Booking booking;

}