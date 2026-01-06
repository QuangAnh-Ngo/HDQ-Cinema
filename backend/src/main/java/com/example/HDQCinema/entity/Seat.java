package com.example.HDQCinema.entity;

import com.example.HDQCinema.enums.SeatStatus;
import com.example.HDQCinema.enums.SeatType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Set;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Seat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "seat_id")
    Long id;

    int seatNumber;
    Character seatRow;

    @Enumerated(EnumType.STRING) // JPA sẽ lưu tên enum dưới dạng string (VD: "VIP", "NORMAL") thay vì số thứ tự (0, 1, 2)
    SeatType seatType;

    @ManyToOne
    @JoinColumn(name = "room_id", nullable = false)
    Room room;

//    @ManyToOne
//    @JoinColumn(name = "booking_id", nullable = false)
//    Booking booking;
    @OneToMany(mappedBy = "seat", cascade = CascadeType.ALL, orphanRemoval = true)
    Set<BookingDetail> bookingDetails;

//    @OneToMany(mappedBy = "seat", cascade = CascadeType.ALL, orphanRemoval = true)
//    Set<BookingSeat> bookingSeats;
}
