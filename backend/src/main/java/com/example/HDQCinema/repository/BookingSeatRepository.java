package com.example.HDQCinema.repository;

import com.example.HDQCinema.entity.BookingSeat;
import com.example.HDQCinema.entity.Seat;
import com.example.HDQCinema.entity.ShowTime;
import com.example.HDQCinema.entity.User;
import com.example.HDQCinema.enums.SeatStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface BookingSeatRepository extends JpaRepository<BookingSeat, String> {

//    @Query(value = """
//           SELECT (count(bookingseat_id) > 0)
//           FROM booking_seat
//           WHERE showtime_id = :showtimeId AND seat_id = :seatId
//           FOR UPDATE;
//            """, nativeQuery = true)
//    boolean existsByShowTimeIdAndSeatIdForUpdate(@Param("showtimeId") String showtimeId,
//                              @Param("seatId") String seatId);

    @Query(value = """
            SELECT * 
            FROM booking_seat 
            WHERE showtime_id = :showtimeId AND seat_id = :seatId 
            FOR UPDATE NOWAIT;
            """, nativeQuery = true)
    // NOWAIT để nếu B thấy dòng đó đang bị lock bởi A thì sẽ trả về exeption luôn
    Optional<BookingSeat> findForUpdate(@Param("showtimeId") String showtimeId,
                                       @Param("seatId") String seatId);

    @Query("select b from BookingSeat b where b.seat = ?1 and b.showTime = ?2")
    BookingSeat findBySeatAndShowTime(Seat seat, ShowTime showTime);

    @Modifying // nếu ko có Spring sẽ báo lỗi hoặc không thực thi vì mặc định nó không biết đây là truy vấn “ghi”
    @Query(value = """
           UPDATE booking_seat 
           SET seat_status = :seatStatus, hold_time = :now
           WHERE showtime_id = :showtimeId AND seat_id = :seatId; 
""", nativeQuery = true)
    void update(@Param("showtimeId") String showtimeId,
                                     @Param("seatId") String seatId,
                                     @Param("seatStatus") String seatStatus,
                                     @Param("now") LocalDateTime holdTime);

    @Modifying
    @Query(value = """
           UPDATE booking_seat 
           SET seat_status = 'AVAILABLE', hold_time = null 
           WHERE seat_status = 'HOLD' AND hold_time < :now; 
""", nativeQuery = true)
    void releaseHold(@Param("now") LocalDateTime now);

    List<BookingSeat> findAllByShowTime(ShowTime showTime);
}
