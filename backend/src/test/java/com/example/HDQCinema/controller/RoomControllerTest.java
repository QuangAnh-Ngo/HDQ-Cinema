package com.example.HDQCinema.controller;

import com.example.HDQCinema.dto.request.RoomRequest;
import com.example.HDQCinema.dto.response.RoomForShowTimeResponse;
import com.example.HDQCinema.dto.response.RoomResponse;
import com.example.HDQCinema.service.RoomService;
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

@WebMvcTest(RoomController.class)
@DisplayName("RoomController Integration Tests")
class RoomControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private RoomService roomService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("POST /rooms - tạo room thành công")
    void testCreateRoom_Success() throws Exception {
        // Given
        RoomRequest request = new RoomRequest();
        request.setRoomName("Phòng chiếu 1");
        request.setCinemaId("cinema-id-123");

        RoomResponse response = RoomResponse.builder()
                .roomId("room-id-123")
                .roomName("Phòng chiếu 1")
                .build();

        when(roomService.create(any(RoomRequest.class))).thenReturn(response);

        // When & Then
        mockMvc.perform(post("/rooms")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.roomId").value("room-id-123"))
                .andExpect(jsonPath("$.result.roomName").value("Phòng chiếu 1"));
    }

    @Test
    @DisplayName("GET /rooms?showtimeId={showtimeId} - lấy room by showtime")
    void testGetRoomByShowTime() throws Exception {
        // Given
        String showtimeId = "showtime-id-123";
        RoomForShowTimeResponse response = RoomForShowTimeResponse.builder()
                .roomId("room-id-123")
                .showtimeId(showtimeId)
                .roomName("Phòng chiếu 1")
                .build();

        when(roomService.get(showtimeId)).thenReturn(response);

        // When & Then
        mockMvc.perform(get("/rooms")
                        .param("showtimeId", showtimeId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.roomId").value("room-id-123"))
                .andExpect(jsonPath("$.result.showtimeId").value(showtimeId));
    }
}

