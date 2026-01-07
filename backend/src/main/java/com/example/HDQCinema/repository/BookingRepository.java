package com.example.HDQCinema.repository;

import com.example.HDQCinema.entity.Booking;
import com.example.HDQCinema.enums.BookingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.time.LocalDate;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    @Query(value = """
            SELECT b.total_price 
            FROM booking b 
            WHERE b.booking_id = :bookingId;
            """, nativeQuery = true)
    double findTotalPriceByBookingId(@Param("bookingId") Long bookingId);

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

    List<Booking> findAllByMemberId(String memberId);

    // Phân trang và tìm kiếm booking
    @Query("SELECT b FROM Booking b WHERE " +
            "(:keyword IS NULL OR :keyword = '' OR " +
            "LOWER(b.member.firstName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(b.member.lastName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(b.member.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "CAST(b.id AS string) LIKE CONCAT('%', :keyword, '%')) " +
            "AND (:status IS NULL OR b.bookingStatus = :status)")
    Page<Booking> searchBookings(
            @Param("keyword") String keyword,
            @Param("status") BookingStatus status,
            Pageable pageable);

    // Phân trang booking theo ngày
    @Query(value = "SELECT * FROM booking WHERE create_time::date = :selected_date",
            countQuery = "SELECT COUNT(*) FROM booking WHERE create_time::date = :selected_date",
            nativeQuery = true)
    Page<Booking> findBookingsByDatePaged(@Param("selected_date") LocalDate date, Pageable pageable);

    // ✅ THÊM: Xóa trực tiếp trong DB - không load entity vào memory (NHANH HƠN)
    @Modifying
    @Transactional
    @Query("DELETE FROM BookingDetail bd WHERE bd.booking.id IN " +
            "(SELECT b.id FROM Booking b WHERE b.createTime < :limitTime AND b.bookingStatus = :status)")
    int deleteExpiredBookingDetails(@Param("limitTime") LocalDateTime limitTime, @Param("status") BookingStatus status);

    @Modifying
    @Transactional
    @Query("DELETE FROM Booking b WHERE b.createTime < :limitTime AND b.bookingStatus = :status")
    int deleteExpiredBookings(@Param("limitTime") LocalDateTime limitTime, @Param("status") BookingStatus status);

    // ✅ THÊM: Đếm số booking hết hạn (để log)
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.createTime < :limitTime AND b.bookingStatus = :status")
    long countExpiredBookings(@Param("limitTime") LocalDateTime limitTime, @Param("status") BookingStatus status);
}