package com.example.HDQCinema.controller;

import com.example.HDQCinema.dto.request.MovieCreationRequest;
import com.example.HDQCinema.dto.response.MovieResponse;
import com.example.HDQCinema.service.MovieService;
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

@WebMvcTest(MovieController.class)
@DisplayName("MovieController Integration Tests")
class MovieControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private MovieService movieService;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper.registerModule(new JavaTimeModule());
    }

    @Test
    @DisplayName("POST /movies - tạo movie thành công")
    void testCreateMovie_Success() throws Exception {
        // Given
        MovieCreationRequest request = new MovieCreationRequest();
        request.setTitle("Avengers: Endgame");
        request.setPoster("poster-url");
        request.setDuration(180);
        request.setLimitAge(13);
        request.setDayStart(LocalDate.now());
        request.setDayEnd(LocalDate.now().plusMonths(2));

        MovieResponse response = MovieResponse.builder()
                .id("movie-id-123")
                .title("Avengers: Endgame")
                .build();

        when(movieService.create(any(MovieCreationRequest.class))).thenReturn(response);

        // When & Then
        mockMvc.perform(post("/movies")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.id").value("movie-id-123"))
                .andExpect(jsonPath("$.result.title").value("Avengers: Endgame"));
    }

    @Test
    @DisplayName("GET /movies/{movieId} - lấy thông tin movie thành công")
    void testGetMovie_Success() throws Exception {
        // Given
        String movieId = "movie-id-123";
        MovieResponse response = MovieResponse.builder()
                .id(movieId)
                .title("Avengers: Endgame")
                .build();

        when(movieService.get(movieId)).thenReturn(response);

        // When & Then
        mockMvc.perform(get("/movies/{movieId}", movieId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.id").value(movieId))
                .andExpect(jsonPath("$.result.title").value("Avengers: Endgame"));
    }

    @Test
    @DisplayName("GET /movies/upcoming?c={cinemaId} - lấy movies upcoming")
    void testGetMoviesUpcoming() throws Exception {
        // Given
        String cinemaId = "cinema-id-123";
        MovieResponse response = MovieResponse.builder()
                .id("movie-1")
                .title("Upcoming Movie")
                .build();

        List<MovieResponse> responses = Arrays.asList(response);
        when(movieService.getMovieUpComing(cinemaId)).thenReturn(responses);

        // When & Then
        mockMvc.perform(get("/movies/upcoming")
                        .param("c", cinemaId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.length()").value(1))
                .andExpect(jsonPath("$.result[0].title").value("Upcoming Movie"));
    }

    @Test
    @DisplayName("GET /movies/showing?c={cinemaId} - lấy movies đang chiếu")
    void testGetMoviesShowing() throws Exception {
        // Given
        String cinemaId = "cinema-id-123";
        MovieResponse response = MovieResponse.builder()
                .id("movie-1")
                .title("Showing Movie")
                .build();

        List<MovieResponse> responses = Arrays.asList(response);
        when(movieService.getMoviesShowing(cinemaId)).thenReturn(responses);

        // When & Then
        mockMvc.perform(get("/movies/showing")
                        .param("c", cinemaId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.length()").value(1))
                .andExpect(jsonPath("$.result[0].title").value("Showing Movie"));
    }
}

