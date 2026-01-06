package com.example.HDQCinema.controller;

import com.example.HDQCinema.dto.request.BookingDetailRequest;
import com.example.HDQCinema.dto.request.BookingRequest;
import com.example.HDQCinema.dto.response.AmountOfPendingBookingResponse;
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
import org.springframework.security.test.context.support.WithMockUser;
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
    @WithMockUser(authorities = "BOOKING")
    @DisplayName("POST /bookings - tạo booking thành công")
    void testCreateBooking_Success() throws Exception {
        // Given
        BookingDetailRequest detail1 = BookingDetailRequest.builder()
                .seatId(1L)
                .build();
        BookingDetailRequest detail2 = BookingDetailRequest.builder()
                .seatId(2L)
                .build();

        BookingRequest request = BookingRequest.builder()
                .memberId("member-id-123")
                .showTimeId(1L)
                .cinemaId(1L)
                .bookingDetailRequests(Arrays.asList(detail1, detail2))
                .build();

        BookingResponse response = BookingResponse.builder()
                .id(1L)
                .totalPrice(250000.0)
                .build();

        when(bookingService.createBooking(any(BookingRequest.class))).thenReturn(response);

        // When & Then
        mockMvc.perform(post("/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.id").value(1))
                .andExpect(jsonPath("$.result.totalPrice").value(250000.0));
    }

    @Test
    @WithMockUser(authorities = {"MANAGE_BOOKING"})
    @DisplayName("GET /bookings/date/{date} - get bookings by date")
    void testGetBookingsByDate() throws Exception {
        // Given
        LocalDate date = LocalDate.now();
        BookingResponse response1 = BookingResponse.builder()
                .id(1L)
                .build();
        BookingResponse response2 = BookingResponse.builder()
                .id(2L)
                .build();

        List<BookingResponse> responses = Arrays.asList(response1, response2);
        when(bookingService.getBookingsByDate(date)).thenReturn(responses);

        // When & Then
        mockMvc.perform(get("/bookings/date/{date}", date))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.length()").value(2));
    }

    @Test
    @WithMockUser(authorities = {"MANAGE_BOOKING"})
    @DisplayName("GET /bookings/pending - get amount of pending bookings")
    void testGetAmountOfPending() throws Exception {
        // Given
        AmountOfPendingBookingResponse response = AmountOfPendingBookingResponse.builder()
                .amount(5)
                .build();
        when(bookingService.countPendingBooking()).thenReturn(response);

        // When & Then
        mockMvc.perform(get("/bookings/pending"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.amount").value(5));
    }
}

