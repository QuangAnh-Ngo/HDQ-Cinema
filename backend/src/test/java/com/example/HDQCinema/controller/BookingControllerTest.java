package com.example.HDQCinema.controller;

import com.example.HDQCinema.dto.request.BookingDetailRequest;
import com.example.HDQCinema.dto.request.BookingRequest;
import com.example.HDQCinema.dto.response.BookingResponse;
import com.example.HDQCinema.service.BookingService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(BookingController.class)
@DisplayName("BookingController Integration Tests")
class BookingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private BookingService bookingService;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper.registerModule(new JavaTimeModule());
    }

    @Test
    @DisplayName("POST /bookings - tạo booking thành công")
    void testCreateBooking_Success() throws Exception {
        // Given
        BookingDetailRequest detail1 = BookingDetailRequest.builder()
                .seatId("seat-1")
                .build();
        BookingDetailRequest detail2 = BookingDetailRequest.builder()
                .seatId("seat-2")
                .build();

        BookingRequest request = BookingRequest.builder()
                .userId("user-id-123")
                .showTimeId("showtime-id-123")
                .cinemaId("cinema-id-123")
                .bookingDetailRequests(Arrays.asList(detail1, detail2))
                .build();

        BookingResponse response = BookingResponse.builder()
                .id("booking-id-123")
                .totalPrice(250000.0)
                .build();

        when(bookingService.createBooking(any(BookingRequest.class))).thenReturn(response);

        // When & Then
        mockMvc.perform(post("/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.id").value("booking-id-123"))
                .andExpect(jsonPath("$.result.totalPrice").value(250000.0));
    }

    @Test
    @DisplayName("POST /bookings/{bookingId} - approve payment thành công")
    void testApprovePayment_Success() throws Exception {
        // Given
        String bookingId = "booking-id-123";
        BookingResponse response = BookingResponse.builder()
                .id(bookingId)
                .build();

        when(bookingService.approvePayment(bookingId)).thenReturn(response);

        // When & Then
        mockMvc.perform(post("/bookings/{bookingId}", bookingId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.id").value(bookingId));
    }

    @Test
    @DisplayName("GET /bookings/{bookingId} - get confirm payment")
    void testGetConfirmPayment() throws Exception {
        // Given
        String bookingId = "booking-id-123";
        when(bookingService.getConfirmPayment(bookingId)).thenReturn(true);

        // When & Then
        mockMvc.perform(get("/bookings/{bookingId}", bookingId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result").value(true));
    }

    @Test
    @DisplayName("GET /bookings/{date} - get bookings by date")
    void testGetBookingsByDate() throws Exception {
        // Given
        LocalDate date = LocalDate.now();
        BookingResponse response1 = BookingResponse.builder()
                .id("booking-1")
                .build();
        BookingResponse response2 = BookingResponse.builder()
                .id("booking-2")
                .build();

        List<BookingResponse> responses = Arrays.asList(response1, response2);
        when(bookingService.getBookings(date)).thenReturn(responses);

        // When & Then
        mockMvc.perform(get("/bookings/{date}", date))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.length()").value(2));
    }
}

