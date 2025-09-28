package com.example.HDQCinema.service;

import com.example.HDQCinema.dto.request.BookingDetailRequest;
import com.example.HDQCinema.dto.request.BookingRequest;
import com.example.HDQCinema.dto.response.BookingResponse;
import com.example.HDQCinema.entity.*;
import com.example.HDQCinema.enums.SeatStatus;
import com.example.HDQCinema.mapper.BookingMapper;
import com.example.HDQCinema.repository.*;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class BookingService {
    BookingRepository bookingReppository;
    UserRepository userRepository;
    ShowTimeRepository showTimeRepository;
    SeatRepository seatRepository;
    BookingDetailRepository detailReppository;
    BookingMapper bookingMapper;

    @Transactional
    public BookingResponse book(BookingRequest request){
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(()-> new RuntimeException("user not exist"));

        ShowTime showTime = showTimeRepository.findById(request.getShowTimeId())
                .orElseThrow(() -> new RuntimeException("showtime not exists"));

        Booking booking= Booking.builder()
                .showTime(showTime)
                .user(user)
                .createTime(LocalDateTime.now())
                .build();

        List<String> seats = new ArrayList<>();

        double totalPrice = 0;

        for(BookingDetailRequest bookingDetailRequest : request.getBookingDetailRequests()){
            Seat seat = seatRepository.findSeatForUpdate(bookingDetailRequest.getSeatId());
            // sẽ chặn các user khác với những ghế đang đc thanh toán

            if(seat.getSeatStatus() != SeatStatus.AVAILABLE){
                throw new RuntimeException("the seat"+seat.getSeatRow()+seat.getSeatNumber()+" is not available");
            }
            seat.setSeatStatus(SeatStatus.HOLD);

            BookingDetail bookingDetail = BookingDetail.builder()
                    .seat(seat)
                    .price(bookingDetailRequest.getPrice())
                    .booking(booking)
                    .build();
            totalPrice += bookingDetailRequest.getPrice();
            detailReppository.save(bookingDetail);
            seats.add(""+ seat.getSeatRow()+seat.getSeatNumber());
        }
        booking.setTotalPrice(totalPrice);
        booking = bookingReppository.save(booking);

        BookingResponse response = bookingMapper.toResponse(booking);
        response.setSeats(seats);
        response.setShowTime(showTime.getStartTime());

        return response;
    }
}
