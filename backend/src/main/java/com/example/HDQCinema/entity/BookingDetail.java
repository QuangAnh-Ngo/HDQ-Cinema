package com.example.HDQCinema.entity;

import com.example.HDQCinema.enums.SeatStatus;
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
@Table(
        name = "booking_detail",
        uniqueConstraints = @UniqueConstraint(columnNames = {"seat_id", "showtime_id"})
)
public class BookingDetail {
    // để seat ko cần bắt buộc phải có booking nữa
    //Seat chỉ biết nó thuộc về Room
    //Việc ghế có được đặt hay không sẽ do BookingSeat quyết định.

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    double price;
    SeatStatus seatStatus;

//    @Enumerated(EnumType.STRING) // JPA sẽ lưu tên enum dưới dạng string (VD: "VIP", "NORMAL") thay vì số thứ tự (0, 1, 2)
//    SeatStatus seatStatus;

    @ManyToOne
    @JoinColumn(name = "seat_id", nullable = false)
    private Seat seat;

    @ManyToOne
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @ManyToOne
    @JoinColumn(name = "showtime_id", nullable = false)
    ShowTime showTime;

}