package com.example.HDQCinema.repository;

import com.example.HDQCinema.dto.query.SeatPerShowTimeDTO;
import com.example.HDQCinema.dto.response.RoomResponse;
import com.example.HDQCinema.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface RoomRepository extends JpaRepository<Room, String> {


    @Query(value = "select r.* " +
            "from room r " +
            "inner join cinema c " +
            "on c.cinema_id = r.cinema_id " +
            "where c.cinema_id = :cinema_id;"
            ,       nativeQuery = true)
    List<Room> findRoomsByCinemaId(@Param("cinema_id") String cinemaId);

    @Query("""
            SELECT DISTINCT new com.example.HDQCinema.dto.query.SeatPerShowTimeDTO(
                        tp.price, s.id, CONCAT(s.seatRow, s.seatNumber), s.seatType, COALESCE(bd.seatStatus, 'AVAILABLE')
                        )
            FROM TicketPrice tp
            INNER JOIN ShowTime st ON st.id = :showtimeId
            INNER JOIN Room r ON r.id = st.room.id
            INNER JOIN Seat s ON s.room.id = r.id AND s.seatType = tp.seatType
            LEFT JOIN BookingDetail bd ON s.id = bd.seat.id AND bd.showTime.id = st.id
            LEFT JOIN DayType dt ON FUNCTION('DATE', st.startTime) BETWEEN dt.dayStart AND dt.dayEnd
            AND tp.dayType.dayType = COALESCE(dt.dayType, UPPER(TO_CHAR(st.startTime, 'DAY')))
            """)
    List<SeatPerShowTimeDTO> getSeatPerShowTimeDTO(@Param("showtimeId") String showtimeId);
}
