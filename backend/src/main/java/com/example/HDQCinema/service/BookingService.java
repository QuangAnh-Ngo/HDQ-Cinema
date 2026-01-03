package com.example.HDQCinema.service;

import com.example.HDQCinema.dto.request.BookingDetailRequest;
import com.example.HDQCinema.dto.request.BookingRequest;
import com.example.HDQCinema.dto.response.AmountOfPendingBookingResponse;
import com.example.HDQCinema.dto.response.BookingResponse;
import com.example.HDQCinema.entity.*;
import com.example.HDQCinema.enums.BookingStatus;
import com.example.HDQCinema.enums.SeatStatus;
import com.example.HDQCinema.exception.AppException;
import com.example.HDQCinema.exception.ErrorCode;
import com.example.HDQCinema.mapper.BookingMapper;
import com.example.HDQCinema.repository.*;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class BookingService {
    BookingRepository bookingReppository;
    MemberRepository memberRepository;
    ShowTimeRepository showTimeRepository;
    SeatRepository seatRepository;
    BookingMapper bookingMapper;
    TicketPriceRepository ticketPriceRepository;
    BookingDetailRepository bookingDetailRepository;
    CinemaRepository cinemaRepository;

//    @Transactional
//    // tạo và quản lý transaction (giao dịch) khi làm việc với DB.
//    // để tránh khi Một user giữ ghế, nhưng trước khi lưu booking, transaction đã commit → user khác vẫn có thể đặt cùng ghế.
//    // nghĩa la khi transaction chưa commit hoặc rollback thì row đó vẫn khóa
//
//    public BookingSeatResponse holdSeats(BookingRequest request) { // khi bấm và trang thanh toán
////        User user = userRepository.findById(request.getUserId())
////                .orElseThrow(() -> new RuntimeException("user not exist"));
//        ShowTime showTime = showTimeRepository.findById(request.getShowTimeId())
//                .orElseThrow(() -> new RuntimeException("showtime not exist"));
//
////        double totalPrice = 0;
////        List<BookingDetail> bookingDetails = new ArrayList<>();
////        Booking booking = Booking.builder()
////                .showTime(showTime)
////                .user(user)
////                .createTime(LocalDateTime.now())
////                .bookingStatus(BookingStatus.PENDING)
////               .totalPrice(totalPrice)
////               .bookingDetails(new HashSet<>(bookingDetails))
////                .build();
//        double totalPrice = 0;
//        List<String> seats = new ArrayList<>();
//        for (BookingDetailRequest detail : request.getBookingDetailRequests()) {
//            Seat seat = seatRepository.findById(detail.getSeatId())
//                    .orElseThrow();
//            BookingSeat bookingSeat = bookingSeatRepository.findForUpdate(showTime.getId(), seat.getId())
//                    .orElseThrow(() -> new RuntimeException("not found"));
//
//            if (bookingSeat.getSeatStatus() == SeatStatus.BOOKED)
//                throw new RuntimeException("Seat already booked");
//            if (bookingSeat.getSeatStatus() == SeatStatus.HELD && bookingSeat.getHoldTime().isAfter(LocalDateTime.now()))
//                throw new RuntimeException("Seat temporarily held");
//
//            double price = ticketPriceRepository.toPrice(seat.getSeatType().toString(), showTime.getId());
//            bookingSeatRepository.update(showTime.getId(), seat.getId(),
//                    SeatStatus.HELD.name(), LocalDateTime.now().plusMinutes(5));
//            totalPrice += price;
//            seats.add(""+seat.getSeatRow()+seat.getSeatNumber());
////            BookingDetail bookingDetail = BookingDetail.builder()
////                    .seat(seat)
////                    .price(price)
////                    .booking(booking)
////                    .build();
////            bookingDetails.add(bookingDetail);
////
////            totalPrice += price;
////        }
////
////        booking.setTotalPrice(totalPrice);
////        booking.setBookingDetails(new HashSet<>(bookingDetails));
////
////        bookingReppository.save(booking);
////        return bookingMapper.toResponse(booking);
//        }
//
//        return BookingSeatResponse.builder()
//                .seats(seats)
//                .price(totalPrice)
//                .build();
//    }

    @Transactional
    // tạo và quản lý transaction (giao dịch) khi làm việc với DB.
    // để tránh khi Một user giữ ghế, nhưng trước khi lưu booking, transaction đã commit → user khác vẫn có thể đặt cùng ghế.
    // nghĩa la khi transaction chưa commit hoặc rollback thì row đó vẫn khóa

    public BookingResponse createBooking(BookingRequest request){ // khi user bấm vào trang thanh toán
        Member member = memberRepository.findById(request.getUserId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        ShowTime showTime = showTimeRepository.findById(request.getShowTimeId())
                .orElseThrow(() -> new RuntimeException("showtime not exist"));
        Cinema cinema = cinemaRepository.findById(request.getCinemaId())
                .orElseThrow(() -> new RuntimeException("cinema not exist"));

        double totalPrice = 0;
        List<BookingDetail> bookingDetails = new ArrayList<>();
        Booking booking = Booking.builder()
                .createTime(LocalDateTime.now())
                .bookingStatus(BookingStatus.PENDING)
                .member(member)
                .build();

        for (BookingDetailRequest detail : request.getBookingDetailRequests()) {
            Seat seat = seatRepository.findById(detail.getSeatId())
                    .orElseThrow(() -> new RuntimeException("seat not exist"));

            double price = ticketPriceRepository.toPrice(seat.getSeatType().toString(), showTime.getId(),cinema.getId());


            BookingDetail bookingDetail = BookingDetail.builder()
                    .seat(seat)
                    .showTime(showTime)
                    .price(price)
                    .booking(booking)
                    .seatStatus(SeatStatus.HELD)
                    .build();
            bookingDetails.add(bookingDetail);

            totalPrice += price;
        }

        booking.setTotalPrice(totalPrice);
        booking.setBookingDetails(new HashSet<>(bookingDetails));
        try {
            booking = bookingReppository.save(booking);
        }catch (DataIntegrityViolationException e){
            throw new AppException(ErrorCode.SEAT_UNAVAILABLE);
        }

        var response = bookingMapper.toResponse(booking);
        response.setShowTime(showTime.getStartTime());

        return response;
    }

    @Transactional
    public void deletePayment(String bookingId){
        bookingDetailRepository.deleteAllByBooking_Id(bookingId);
        bookingReppository.deleteById(bookingId);
    }


    @Transactional
    public BookingResponse approvePayment(String bookingId) { // admin thấy user thanh toán và bấm xác nhận user đã thanh toán
        Booking booking = bookingReppository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        bookingDetailRepository.updateSeatStatus(booking.getId());

        var showtime = bookingDetailRepository.findFirstShowTimeByBooking(bookingId);

        booking.setBookingStatus(BookingStatus.CONFIRM);
        bookingReppository.save(booking);

        var response = bookingMapper.toResponse(booking);
        response.setShowTime(showtime);
        return response;
    }

    @Transactional
    public boolean getConfirmPayment(String bookingId){ // gửi api liên tục để xem admin đã xác nhận chưa
        Booking booking = bookingReppository.findById(bookingId)
                .orElseThrow(()-> new RuntimeException("Booking not found"));
        return booking.getBookingStatus().equals(BookingStatus.CONFIRM);
    }

    @Transactional
    @Modifying(clearAutomatically = true)
    public void deleteExpiredBookings(LocalDateTime lim) {
        List<Booking> expiredBookings = bookingReppository.findAllByCreateTimeBeforeAndBookingStatus(lim, BookingStatus.PENDING);
        bookingReppository.deleteAll(expiredBookings);
    }


    public List<BookingResponse> getBookings(LocalDate date) {
        List<Booking> bookings =  bookingReppository.findBookingsByCreateTime_Date(date);
        return bookingMapper.toResponses(bookings);
    }

    public AmountOfPendingBookingResponse countPendingBooking(){
        var num =  bookingReppository.countBookingsByBookingStatusPending();
        return AmountOfPendingBookingResponse.builder().amount(num).build();
    }
}
