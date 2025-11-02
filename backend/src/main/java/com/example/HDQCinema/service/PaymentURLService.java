package com.example.HDQCinema.service;

import com.example.HDQCinema.dto.response.PaymentURLResponse;
import com.example.HDQCinema.entity.Booking;
import com.example.HDQCinema.entity.Member;
import com.example.HDQCinema.entity.PaymentURL;
import com.example.HDQCinema.mapper.PaymentURLMapper;
import com.example.HDQCinema.repository.BookingRepository;
import com.example.HDQCinema.repository.MemberRepository;
import com.example.HDQCinema.repository.PaymentURLRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PaymentURLService {
    PaymentURLRepository paymentURLRepository;
    PaymentURLMapper paymentURLMapper;
    BookingRepository bookingRepository;
    MemberRepository memberRepository;

    public void create(String bookingId, String url){
        // sử dụng trong khi tạo paymentUrl
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("booking not exist"));
        Member member = memberRepository.findById(booking.getMember().getId())
                .orElseThrow(() -> new RuntimeException("member not exist"));

        var paymentURL = PaymentURL.builder()
                .member(member)
                .url(url)
                .createdAt(booking.getCreateTime())
                .amount(booking.getTotalPrice())
                .booking(booking)
                .build();
        paymentURLRepository.save(paymentURL);

    }

    public List<PaymentURLResponse> getURLFromMember(String memberId){
        List<PaymentURL> paymentURLS = paymentURLRepository.findAllByMember_Id(memberId);
        return paymentURLMapper.toResponses(paymentURLS);
    }

    @Transactional
    public void deleteURL(String bookingId){
        // sử dụng sau khi thanh toán thành công hoặc hủy thanh toán
        paymentURLRepository.deleteByBooking_Id(bookingId);
    }
}
