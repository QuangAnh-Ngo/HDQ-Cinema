package com.example.HDQCinema.repository;

import com.example.HDQCinema.dto.response.AmountOfPendingBookingResponse;
import com.example.HDQCinema.entity.Booking;
import com.example.HDQCinema.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, String> {




    @Query(value = """
            SELECT b.total_price 
            FROM booking b 
            WHERE b.booking_id = :bookingId;
            """, nativeQuery = true)
    double findTotalPriceByBookingId(@Param("bookingId") String bookingId);

    List<Booking> findAllByCreateTimeBeforeAndBookingStatus(LocalDateTime createTimeBefore, BookingStatus bookingStatus);

    @Query(value = """
            SELECT COUNT(*)
            FROM booking
            WHERE booking_status = 'PENDING';       
            """, nativeQuery = true)
    int countBookingsByBookingStatusPending();

    @Query(value = """
            SELECT *
            FROM booking
            WHERE create_time::date = :selected_date;
            """, nativeQuery = true)
    List<Booking> findBookingsByCreateTime_Date(@Param("selected_date") LocalDate date);
}