package com.example.HDQCinema.repository;

import com.example.HDQCinema.entity.TicketPrice;
import com.example.HDQCinema.enums.SeatType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Date;

@Repository
public interface TicketPriceRepository extends JpaRepository<TicketPrice, String> {
    @Query(value = """
            SELECT tp.price
            FROM ticket_price tp
            WHERE day_type =
            (SELECT dt.day_type
            FROM day_type dt
            INNER JOIN show_time st
            ON (
            st.showtime_id = :showtimeId  AND (
            (dt.day_start IS NULL AND st.start_time >= dt.day_start AND st.start_time < dt.day_end + INTERVAL '1' DAY) 
            OR 
            (day_type = UPPER(DAYNAME(:day)))
            )
            )
            )
            AND tp.seat_type = :seatType;
            """,
    nativeQuery = true) // Không cần DATE(st.start_time) → giữ index.
    double toPrice(@Param("day") Date day,
                   @Param("seatType") SeatType seatType,
                   @Param("showtimeId") String showtimeId);
}
