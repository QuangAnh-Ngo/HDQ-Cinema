package com.example.HDQCinema.repository;

import com.example.HDQCinema.entity.TicketPrice;
import com.example.HDQCinema.enums.SeatType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;


@Repository
public interface TicketPriceRepository extends JpaRepository<TicketPrice, String> {
    @Query(value = """
            SELECT tp.price
            FROM ticket_price tp
            WHERE tp.day_type = COALESCE(
              (
                SELECT dt.day_type
                FROM day_type dt
                JOIN show_time st
                  ON st.showtime_id = :showtimeId
                 AND dt.day_start IS NOT NULL
                 AND st.start_time BETWEEN dt.day_start AND dt.day_end + INTERVAL '1 day'
              ),
              (
                SELECT UPPER(TO_CHAR(st.start_time, 'DAY'))
                FROM show_time st
                WHERE st.showtime_id = :showtimeId
              )
            )
            AND tp.seat_type = :seatType;
            """,
    nativeQuery = true) // COALESCE là hàm SQL trả về giá trị đầu tiên không NULL trong danh sách các giá trị được đưa vào.
    double toPrice(@Param("seatType") String seatType,
                   @Param("showtimeId") String showtimeId);

    //SELECT tp.price
    //FROM ticket_price tp
    //JOIN show_time st ON st.showtime_id = :showtimeId
    //LEFT JOIN day_type dt
    //  ON st.start_time BETWEEN dt.day_start AND dt.day_end + INTERVAL '1 day'
    //WHERE tp.day_type = COALESCE(
    //    dt.day_type,
    //    UPPER(TRIM(TO_CHAR(st.start_time, 'DAY')))
    //)
    //AND tp.seat_type = :seatType
    //LIMIT 1;
}
