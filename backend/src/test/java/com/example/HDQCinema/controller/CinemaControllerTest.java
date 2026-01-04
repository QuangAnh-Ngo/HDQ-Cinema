package com.example.HDQCinema.controller;

import com.example.HDQCinema.dto.request.CinemaCreationRequest;
import com.example.HDQCinema.dto.response.CinemaResponse;
import com.example.HDQCinema.service.CinemaService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CinemaController.class)
@DisplayName("CinemaController Integration Tests")
class CinemaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CinemaService cinemaService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("POST /theaters - tạo cinema thành công")
    void testCreateCinema_Success() throws Exception {
        // Given
        CinemaCreationRequest request = new CinemaCreationRequest();
        request.setName("HDQ Cinema Hà Nội");
        request.setCity("Hà Nội");
        request.setDistrict("Cầu Giấy");
        request.setAddress("123 Đường ABC");

        CinemaResponse response = new CinemaResponse();
        response.setId("cinema-id-123");
        response.setName("HDQ Cinema Hà Nội");
        response.setCity("Hà Nội");
        response.setDistrict("Cầu Giấy");
        response.setAddress("123 Đường ABC");

        when(cinemaService.create(any(CinemaCreationRequest.class))).thenReturn(response);

        // When & Then
        mockMvc.perform(post("/theaters")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.id").value("cinema-id-123"))
                .andExpect(jsonPath("$.result.name").value("HDQ Cinema Hà Nội"));
    }

    @Test
    @DisplayName("GET /theaters/{cinemaId} - lấy thông tin cinema thành công")
    void testGetCinema_Success() throws Exception {
        // Given
        String cinemaId = "cinema-id-123";
        CinemaResponse response = new CinemaResponse();
        response.setId(cinemaId);
        response.setName("HDQ Cinema Hà Nội");

        when(cinemaService.get(cinemaId)).thenReturn(response);

        // When & Then
        mockMvc.perform(get("/theaters/{cinemaId}", cinemaId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.id").value(cinemaId))
                .andExpect(jsonPath("$.result.name").value("HDQ Cinema Hà Nội"));
    }

    @Test
    @DisplayName("GET /theaters - lấy tất cả cinemas thành công")
    void testGetAllCinemas_Success() throws Exception {
        // Given
        CinemaResponse response1 = new CinemaResponse();
        response1.setId("cinema-1");
        response1.setName("Cinema 1");

        CinemaResponse response2 = new CinemaResponse();
        response2.setId("cinema-2");
        response2.setName("Cinema 2");

        List<CinemaResponse> responses = Arrays.asList(response1, response2);
        when(cinemaService.getAll()).thenReturn(responses);

        // When & Then
        mockMvc.perform(get("/theaters"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.length()").value(2))
                .andExpect(jsonPath("$.result[0].id").value("cinema-1"))
                .andExpect(jsonPath("$.result[1].id").value("cinema-2"));
    }
}

