package com.example.HDQCinema.repository;

import com.example.HDQCinema.entity.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface SeatRepository extends JpaRepository<Seat, String> {
    @Query(value = "SELECT s.* " +
            "FROM seat s " +
            "WHERE s.seat_id = :seatId " +
            "FOR UPDATE;"
    , nativeQuery = true)
    Seat findSeatForUpdate(@Param("seatId") String id);
}
