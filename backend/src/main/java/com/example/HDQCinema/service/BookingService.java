package com.example.HDQCinema.service;

import com.example.HDQCinema.dto.request.BookingDetailRequest;
import com.example.HDQCinema.dto.request.BookingRequest;
import com.example.HDQCinema.dto.response.AmountOfPendingBookingResponse;
import com.example.HDQCinema.dto.response.BookingResponse;
import com.example.HDQCinema.dto.response.PageResponse;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.security.access.prepost.PreAuthorize;
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
    BookingRepository bookingRepository;
    MemberRepository memberRepository;
    ShowTimeRepository showTimeRepository;
    SeatRepository seatRepository;
    BookingMapper bookingMapper;
    TicketPriceRepository ticketPriceRepository;
    BookingDetailRepository bookingDetailRepository;
    CinemaRepository cinemaRepository;

    @Transactional
    public BookingResponse createBooking(BookingRequest request){ // khi user bấm vào trang thanh toán
        Member member = memberRepository.findById(request.getMemberId())
                .orElseThrow(() -> new AppException(ErrorCode.MEMBER_NOT_FOUND));
        ShowTime showTime = showTimeRepository.findById(request.getShowTimeId())
                .orElseThrow(() -> new AppException(ErrorCode.SHOWTIME_NOT_FOUND));
        Cinema cinema = cinemaRepository.findById(request.getCinemaId())
                .orElseThrow(() -> new AppException(ErrorCode.CINEMA_NOT_FOUND));

        double totalPrice = 0;
        List<BookingDetail> bookingDetails = new ArrayList<>();
        Booking booking = Booking.builder()
                .createTime(LocalDateTime.now())
                .bookingStatus(BookingStatus.PENDING)
                .member(member)
                .build();

        for (BookingDetailRequest detail : request.getBookingDetailRequests()) {
            Seat seat = seatRepository.findById(detail.getSeatId())
                    .orElseThrow(() -> new AppException(ErrorCode.SEAT_NOT_FOUND));


            double price = ticketPriceRepository.toPrice(seat.getSeatType().toString(), showTime.getId(), cinema.getId())
                    .orElseThrow(() -> new AppException(ErrorCode.PRICE_NOT_EXITED));

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
            booking = bookingRepository.save(booking);
        }catch (DataIntegrityViolationException e){
            throw new AppException(ErrorCode.SEAT_UNAVAILABLE);
        }

        var response = bookingMapper.toResponse(booking);
        response.setShowTime(showTime.getStartTime());

        return response;
    }

    @Transactional
    public void deletePayment(Long bookingId){
        bookingDetailRepository.deleteAllByBooking_Id(bookingId);
        bookingRepository.deleteById(bookingId);
    }

    @Transactional
    public BookingResponse approvePayment(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        bookingDetailRepository.updateSeatStatus(booking.getId());

        var showtime = bookingDetailRepository.findFirstShowTimeByBooking(bookingId);

        booking.setBookingStatus(BookingStatus.CONFIRM);
        bookingRepository.save(booking);

        var response = bookingMapper.toResponse(booking);
        response.setShowTime(showtime);
        return response;
    }


    @Transactional
    @Modifying(clearAutomatically = true)
    public void deleteExpiredBookings(LocalDateTime lim) {
        // ✅ SỬA: Sử dụng bulk delete trực tiếp trong DB thay vì load entity
        // Bước 1: Xóa BookingDetail trước (do foreign key)
        int deletedDetails = bookingRepository.deleteExpiredBookingDetails(lim, BookingStatus.PENDING);

        // Bước 2: Xóa Booking
        int deletedBookings = bookingRepository.deleteExpiredBookings(lim, BookingStatus.PENDING);

        if (deletedBookings > 0) {
            log.info("Deleted {} expired bookings and {} booking details", deletedBookings, deletedDetails);
        }
    }


    public List<BookingResponse> getBookingsByDate(LocalDate date) {
        List<Booking> bookings =  bookingRepository.findBookingsByCreateTime_Date(date);
        return bookingMapper.toResponses(bookings);
    }

    public PageResponse<BookingResponse> getBookingsPaged(int page, int size, String keyword,
            BookingStatus status, String sortBy, String sortDir) {
        Sort sort = Sort.by(sortDir.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC,
                sortBy != null ? sortBy : "id");
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Booking> bookingPage = bookingRepository.searchBookings(keyword, status, pageable);

        List<BookingResponse> bookingResponses = bookingMapper.toResponses(bookingPage.getContent());

        return PageResponse.<BookingResponse>builder()
                .currentPage(page)
                .pageSize(size)
                .totalElements(bookingPage.getTotalElements())
                .totalPages(bookingPage.getTotalPages())
                .data(bookingResponses)
                .build();
    }

    public List<BookingResponse> getBookingsByMember(String memberId) {
        if (!memberRepository.existsById(memberId)) {
            throw new AppException(ErrorCode.MEMBER_NOT_FOUND);
        }

        var bookings = bookingRepository.findAllByMemberId(memberId);
        return bookingMapper.toResponses(bookings);
    }

    public AmountOfPendingBookingResponse countPendingBooking(){
        var num =  bookingRepository.countBookingsByBookingStatusPending();
        return AmountOfPendingBookingResponse.builder().amount(num).build();
    }
}
