package com.example.HDQCinema.repository;

import com.example.HDQCinema.entity.Booking;
import com.example.HDQCinema.entity.PaymentURL;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentURLRepository extends JpaRepository<PaymentURL, String> {
    List<PaymentURL> findAllByMember_Id(String memberId);

    void deleteByBooking_Id(String bookingId);
}
