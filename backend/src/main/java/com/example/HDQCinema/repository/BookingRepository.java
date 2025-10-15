package com.example.HDQCinema.repository;

import com.example.HDQCinema.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Repository
public interface BookingRepository extends JpaRepository<Booking, String> {



    @Modifying
    @Query(value = """
        DELETE  
        FROM booking b 
        WHERE MINUTE(TIMEDIFF(NOW(), b.create_time)) > :lim AND b.booking_status = 'PENDING'; 
        """, nativeQuery = true)
    void deleteBookingByTimeLimit(@Param("lim") Integer lim);
}