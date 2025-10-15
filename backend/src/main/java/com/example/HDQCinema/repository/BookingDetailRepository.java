package com.example.HDQCinema.repository;

import com.example.HDQCinema.entity.BookingDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface BookingDetailRepository extends JpaRepository<BookingDetail, String> {
    @Modifying
    @Query(value = """
            DELETE FROM booking_detail
            WHERE booking_id IN(
                        SELECT b.booking_id
                        FROM booking b
                        WHERE MINUTE(TIMEDIFF(NOW(), b.create_time)) > :lim AND b.booking_status = 'PENDING'
                        )
            """, nativeQuery = true)
    void deleteBookingDetailByTimeLimit(@Param("lim") Integer lim);
}
