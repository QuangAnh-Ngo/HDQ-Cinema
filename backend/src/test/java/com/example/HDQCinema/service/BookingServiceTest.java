package com.example.HDQCinema.service;

import com.example.HDQCinema.dto.request.BookingDetailRequest;
import com.example.HDQCinema.dto.request.BookingRequest;
import com.example.HDQCinema.dto.response.AmountOfPendingBookingResponse;
import com.example.HDQCinema.dto.response.BookingResponse;
import com.example.HDQCinema.entity.*;
import com.example.HDQCinema.enums.BookingStatus;
import com.example.HDQCinema.enums.SeatType;
import com.example.HDQCinema.exception.AppException;
import com.example.HDQCinema.exception.ErrorCode;
import com.example.HDQCinema.mapper.BookingMapper;
import com.example.HDQCinema.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("BookingService Unit Tests")
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private MemberRepository memberRepository;

    @Mock
    private ShowTimeRepository showTimeRepository;

    @Mock
    private SeatRepository seatRepository;

    @Mock
    private BookingMapper bookingMapper;

    @Mock
    private TicketPriceRepository ticketPriceRepository;

    @Mock
    private BookingDetailRepository bookingDetailRepository;

    @Mock
    private CinemaRepository cinemaRepository;

    @InjectMocks
    private BookingService bookingService;

    private BookingRequest bookingRequest;
    private Member member;
    private ShowTime showTime;
    private Cinema cinema;
    private Seat seat1;
    private Seat seat2;
    private String memberId;
    private String showTimeId;
    private String cinemaId;
    private String seatId1;
    private String seatId2;

    @BeforeEach
    void setUp() {
        memberId = "member-id-123";
        showTimeId = "showtime-id-123";
        cinemaId = "cinema-id-123";
        seatId1 = "seat-id-1";
        seatId2 = "seat-id-2";

        member = Member.builder()
                .id(memberId)
                .username("testuser")
                .build();

        cinema = Cinema.builder()
                .id(cinemaId)
                .name("HDQ Cinema")
                .build();

        Room room = Room.builder()
                .id("room-id-123")
                .cinema(cinema)
                .build();

        Movie movie = Movie.builder()
                .id("movie-id-123")
                .title("Test Movie")
                .build();

        showTime = ShowTime.builder()
                .id(showTimeId)
                .startTime(LocalDateTime.now().plusDays(1))
                .room(room)
                .movie(movie)
                .build();

        seat1 = Seat.builder()
                .id(seatId1)
                .seatRow('A')
                .seatNumber(1)
                .seatType(SeatType.CLASSIC)
                .room(room)
                .build();

        seat2 = Seat.builder()
                .id(seatId2)
                .seatRow('A')
                .seatNumber(2)
                .seatType(SeatType.VIP)
                .room(room)
                .build();

        BookingDetailRequest detail1 = BookingDetailRequest.builder()
                .seatId(seatId1)
                .build();

        BookingDetailRequest detail2 = BookingDetailRequest.builder()
                .seatId(seatId2)
                .build();

        bookingRequest = BookingRequest.builder()
                .userId(memberId)
                .showTimeId(showTimeId)
                .cinemaId(cinemaId)
                .bookingDetailRequests(Arrays.asList(detail1, detail2))
                .build();
    }

    @Test
    @DisplayName("Test create booking - thành công")
    void testCreateBooking_Success() {
        // Given
        when(memberRepository.findById(memberId)).thenReturn(Optional.of(member));
        when(showTimeRepository.findById(showTimeId)).thenReturn(Optional.of(showTime));
        when(cinemaRepository.findById(cinemaId)).thenReturn(Optional.of(cinema));
        when(seatRepository.findById(seatId1)).thenReturn(Optional.of(seat1));
        when(seatRepository.findById(seatId2)).thenReturn(Optional.of(seat2));
        when(ticketPriceRepository.toPrice("CLASSIC", showTimeId, cinemaId)).thenReturn(100000.0);
        when(ticketPriceRepository.toPrice("VIP", showTimeId, cinemaId)).thenReturn(150000.0);

        Booking savedBooking = Booking.builder()
                .id("booking-id-123")
                .member(member)
                .totalPrice(250000.0)
                .bookingStatus(BookingStatus.PENDING)
                .build();

        when(bookingRepository.save(any(Booking.class))).thenReturn(savedBooking);

        BookingResponse bookingResponse = BookingResponse.builder()
                .id("booking-id-123")
                .totalPrice(250000.0)
                .build();
        when(bookingMapper.toResponse(any(Booking.class))).thenReturn(bookingResponse);

        // When
        BookingResponse result = bookingService.createBooking(bookingRequest);

        // Then
        assertNotNull(result);
        assertEquals(250000.0, result.getTotalPrice());
        verify(memberRepository, times(1)).findById(memberId);
        verify(showTimeRepository, times(1)).findById(showTimeId);
        verify(cinemaRepository, times(1)).findById(cinemaId);
        verify(seatRepository, times(1)).findById(seatId1);
        verify(seatRepository, times(1)).findById(seatId2);
        verify(bookingRepository, times(1)).save(any(Booking.class));
    }

    @Test
    @DisplayName("Test create booking - member không tồn tại")
    void testCreateBooking_MemberNotFound() {
        // Given
        when(memberRepository.findById(memberId)).thenReturn(Optional.empty());

        // When & Then
        AppException exception = assertThrows(AppException.class, () -> {
            bookingService.createBooking(bookingRequest);
        });

        assertEquals(ErrorCode.USER_NOT_FOUND, exception.getErrorCode());
        verify(memberRepository, times(1)).findById(memberId);
        verify(bookingRepository, never()).save(any());
    }

    @Test
    @DisplayName("Test create booking - showtime không tồn tại")
    void testCreateBooking_ShowTimeNotFound() {
        // Given
        when(memberRepository.findById(memberId)).thenReturn(Optional.of(member));
        when(showTimeRepository.findById(showTimeId)).thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            bookingService.createBooking(bookingRequest);
        });

        assertEquals("showtime not exist", exception.getMessage());
        verify(showTimeRepository, times(1)).findById(showTimeId);
        verify(bookingRepository, never()).save(any());
    }

    @Test
    @DisplayName("Test create booking - seat không tồn tại")
    void testCreateBooking_SeatNotFound() {
        // Given
        when(memberRepository.findById(memberId)).thenReturn(Optional.of(member));
        when(showTimeRepository.findById(showTimeId)).thenReturn(Optional.of(showTime));
        when(cinemaRepository.findById(cinemaId)).thenReturn(Optional.of(cinema));
        when(seatRepository.findById(seatId1)).thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            bookingService.createBooking(bookingRequest);
        });

        assertEquals("seat not exist", exception.getMessage());
        verify(seatRepository, times(1)).findById(seatId1);
        verify(bookingRepository, never()).save(any());
    }

    @Test
    @DisplayName("Test create booking - ghế đã được đặt (DataIntegrityViolationException)")
    void testCreateBooking_SeatUnavailable() {
        // Given
        when(memberRepository.findById(memberId)).thenReturn(Optional.of(member));
        when(showTimeRepository.findById(showTimeId)).thenReturn(Optional.of(showTime));
        when(cinemaRepository.findById(cinemaId)).thenReturn(Optional.of(cinema));
        when(seatRepository.findById(seatId1)).thenReturn(Optional.of(seat1));
        when(seatRepository.findById(seatId2)).thenReturn(Optional.of(seat2));
        when(ticketPriceRepository.toPrice(anyString(), anyString(), anyString())).thenReturn(100000.0);
        when(bookingRepository.save(any(Booking.class)))
                .thenThrow(new DataIntegrityViolationException("Seat already booked"));

        // When & Then
        AppException exception = assertThrows(AppException.class, () -> {
            bookingService.createBooking(bookingRequest);
        });

        assertEquals(ErrorCode.SEAT_UNAVAILABLE, exception.getErrorCode());
    }

    @Test
    @DisplayName("Test approve payment - thành công")
    void testApprovePayment_Success() {
        // Given
        String bookingId = "booking-id-123";
        Booking booking = Booking.builder()
                .id(bookingId)
                .member(member)
                .bookingStatus(BookingStatus.PENDING)
                .build();

        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(booking));
        when(bookingDetailRepository.findFirstShowTimeByBooking(bookingId))
                .thenReturn(showTime.getStartTime());
        when(bookingRepository.save(any(Booking.class))).thenReturn(booking);

        BookingResponse bookingResponse = BookingResponse.builder()
                .id(bookingId)
                .build();
        when(bookingMapper.toResponse(any(Booking.class))).thenReturn(bookingResponse);

        // When
        BookingResponse result = bookingService.approvePayment(bookingId);

        // Then
        assertNotNull(result);
        assertEquals(BookingStatus.CONFIRM, booking.getBookingStatus());
        verify(bookingRepository, times(1)).findById(bookingId);
        verify(bookingDetailRepository, times(1)).updateSeatStatus(bookingId);
        verify(bookingRepository, times(1)).save(booking);
    }

    @Test
    @DisplayName("Test get confirm payment - đã xác nhận")
    void testGetConfirmPayment_Confirmed() {
        // Given
        String bookingId = "booking-id-123";
        Booking booking = Booking.builder()
                .id(bookingId)
                .bookingStatus(BookingStatus.CONFIRM)
                .build();

        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(booking));

        // When
        boolean result = bookingService.getConfirmPayment(bookingId);

        // Then
        assertTrue(result);
        verify(bookingRepository, times(1)).findById(bookingId);
    }

    @Test
    @DisplayName("Test get confirm payment - chưa xác nhận")
    void testGetConfirmPayment_Pending() {
        // Given
        String bookingId = "booking-id-123";
        Booking booking = Booking.builder()
                .id(bookingId)
                .bookingStatus(BookingStatus.PENDING)
                .build();

        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(booking));

        // When
        boolean result = bookingService.getConfirmPayment(bookingId);

        // Then
        assertFalse(result);
    }

    @Test
    @DisplayName("Test get bookings by date - thành công")
    void testGetBookings_Success() {
        // Given
        LocalDate date = LocalDate.now();
        Booking booking1 = Booking.builder()
                .id("booking-1")
                .createTime(LocalDateTime.now())
                .build();
        Booking booking2 = Booking.builder()
                .id("booking-2")
                .createTime(LocalDateTime.now())
                .build();

        List<Booking> bookings = Arrays.asList(booking1, booking2);
        when(bookingRepository.findBookingsByCreateTime_Date(date)).thenReturn(bookings);

        BookingResponse response1 = BookingResponse.builder()
                .id("booking-1")
                .build();
        BookingResponse response2 = BookingResponse.builder()
                .id("booking-2")
                .build();
        when(bookingMapper.toResponses(bookings)).thenReturn(Arrays.asList(response1, response2));

        // When
        List<BookingResponse> result = bookingService.getBookings(date);

        // Then
        assertNotNull(result);
        assertEquals(2, result.size());
        verify(bookingRepository, times(1)).findBookingsByCreateTime_Date(date);
    }

    @Test
    @DisplayName("Test count pending bookings - thành công")
    void testCountPendingBooking_Success() {
        // Given
        int pendingCount = 5;
        when(bookingRepository.countBookingsByBookingStatusPending()).thenReturn(pendingCount);

        // When
        AmountOfPendingBookingResponse result = bookingService.countPendingBooking();

        // Then
        assertNotNull(result);
        assertEquals(5, result.getAmount());
        verify(bookingRepository, times(1)).countBookingsByBookingStatusPending();
    }
}

