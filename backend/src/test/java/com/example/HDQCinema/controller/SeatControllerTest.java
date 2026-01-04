package com.example.HDQCinema.controller;

import com.example.HDQCinema.dto.request.SeatCreationRequest;
import com.example.HDQCinema.dto.response.SeatCreationResponse;
import com.example.HDQCinema.service.SeatService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(SeatController.class)
@DisplayName("SeatController Integration Tests")
class SeatControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private SeatService seatService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("POST /seats - tạo seats thành công")
    void testCreateSeats_Success() throws Exception {
        // Given
        SeatCreationRequest request = SeatCreationRequest.builder()
                .roomId("room-id-123")
                .firstSeatRow('A')
                .lastSeatRow('C')
                .firstColumnSeatNumber(1)
                .lastColumnSeatNumber(5)
                .type("NORMAL")
                .build();

        SeatCreationResponse response = SeatCreationResponse.builder()
                .seat("success")
                .build();

        when(seatService.create(any(SeatCreationRequest.class))).thenReturn(response);

        // When & Then
        mockMvc.perform(post("/seats")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.seat").value("success"));
    }
}

