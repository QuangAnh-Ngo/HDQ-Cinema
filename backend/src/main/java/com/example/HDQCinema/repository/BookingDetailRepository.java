package com.example.HDQCinema.repository;

import com.example.HDQCinema.entity.Booking;
import com.example.HDQCinema.entity.BookingDetail;
import com.example.HDQCinema.entity.Seat;
import com.example.HDQCinema.entity.ShowTime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface BookingDetailRepository extends JpaRepository<BookingDetail, String> {
//    @Query(value = """
//            DELETE FROM booking_detail
//            WHERE booking_id IN(
//                        SELECT b.booking_id
//                        FROM booking b
//                        WHERE EXTRACT(EPOCH FROM (NOW() - b.create_time)) / 60 > :lim AND b.booking_status = 'PENDING'
//                        )
//            """, nativeQuery = true)

    @Modifying
    @Query(value = """
                UPDATE booking_detail 
                SET seat_status = 'BOOKED' 
                WHERE booking_id = :bookingId;
                """, nativeQuery = true)
    void updateSeatStatus(@Param("bookingId") String bookingId);

    BookingDetail findBySeatAndShowTime(Seat seat, ShowTime showTime);

    @Query(
            value = "SELECT st.start_time FROM show_time st WHERE showtime_id = (SELECT b.showtime_id FROM booking_detail b WHERE b.booking_id = :bookingId LIMIT 1);",
            nativeQuery = true
    )
    LocalDateTime findFirstShowTimeByBooking(@Param("bookingId") String bookingId);

    void deleteAllByBooking_Id(String bookingId);
}
