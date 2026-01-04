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
            JOIN show_time st ON st.showtime_id = :showtimeId
            JOIN cinema c ON c.cinema_id = :cinemaId
            LEFT JOIN day_type dt ON st.start_time::date BETWEEN dt.day_start AND dt.day_end
            WHERE tp.seat_type = :seatType
            AND tp.day_type = COALESCE(dt.day_type, UPPER(TO_CHAR(st.start_time, 'DAY')))
            ;
            """,
    nativeQuery = true) // COALESCE là hàm SQL trả về giá trị đầu tiên không NULL trong danh sách các giá trị được đưa vào.
    Double toPrice(@Param("seatType") String seatType,
                   @Param("showtimeId") String showtimeId,
                   @Param("cinemaId") String cinemaId);


    TicketPrice findTicketPriceById(String id);

    void deleteTicketPriceById(String id);

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
