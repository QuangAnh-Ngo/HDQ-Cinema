package com.example.HDQCinema.service;

import com.example.HDQCinema.dto.request.MovieCreationRequest;
import com.example.HDQCinema.dto.response.MovieResponse;
import com.example.HDQCinema.entity.Movie;
import com.example.HDQCinema.mapper.MovieMapper;
import com.example.HDQCinema.repository.MovieRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("MovieService Unit Tests")
class MovieServiceTest {

    @Mock
    private MovieRepository movieRepository;

    @Mock
    private MovieMapper movieMapper;

    @InjectMocks
    private MovieService movieService;

    private MovieCreationRequest movieCreationRequest;
    private Movie movie;
    private MovieResponse movieResponse;
    private String movieId;

    @BeforeEach
    void setUp() {
        movieId = "movie-id-123";

        movieCreationRequest = new MovieCreationRequest();
        movieCreationRequest.setTitle("Avengers: Endgame");
        movieCreationRequest.setPoster("poster-url");
        movieCreationRequest.setDuration(180);
        movieCreationRequest.setLimitAge(13);
        movieCreationRequest.setDayStart(LocalDate.now());
        movieCreationRequest.setDayEnd(LocalDate.now().plusMonths(2));
        movieCreationRequest.setDirector("Russo Brothers");
        movieCreationRequest.setGenre("Action");
        movieCreationRequest.setDescription("Epic conclusion");
        movieCreationRequest.setTrailer_url("trailer-url");

        movie = Movie.builder()
                .id(movieId)
                .title("Avengers: Endgame")
                .poster("poster-url")
                .duration(180)
                .limitAge(13)
                .dayStart(LocalDate.now())
                .dayEnd(LocalDate.now().plusMonths(2))
                .director("Russo Brothers")
                .genre("Action")
                .description("Epic conclusion")
                .trailer_url("trailer-url")
                .build();

        movieResponse = MovieResponse.builder()
                .id(movieId)
                .title("Avengers: Endgame")
                .build();
    }

    @Test
    @DisplayName("Test create movie - thành công")
    void testCreateMovie_Success() {
        // Given
        when(movieMapper.toMovie(any(MovieCreationRequest.class))).thenReturn(movie);
        when(movieRepository.save(any(Movie.class))).thenReturn(movie);
        when(movieMapper.toMovieResponse(any(Movie.class))).thenReturn(movieResponse);

        // When
        MovieResponse result = movieService.create(movieCreationRequest);

        // Then
        assertNotNull(result);
        assertEquals(movieId, result.getId());
        assertEquals("Avengers: Endgame", result.getTitle());
        verify(movieMapper, times(1)).toMovie(movieCreationRequest);
        verify(movieRepository, times(1)).save(movie);
        verify(movieMapper, times(1)).toMovieResponse(movie);
    }

    @Test
    @DisplayName("Test get movie by id - thành công")
    void testGetMovieById_Success() {
        // Given
        when(movieRepository.findById(movieId)).thenReturn(Optional.of(movie));
        when(movieMapper.toMovieResponse(any(Movie.class))).thenReturn(movieResponse);

        // When
        MovieResponse result = movieService.get(movieId);

        // Then
        assertNotNull(result);
        assertEquals(movieId, result.getId());
        verify(movieRepository, times(1)).findById(movieId);
        verify(movieMapper, times(1)).toMovieResponse(movie);
    }

    @Test
    @DisplayName("Test get movie by id - không tìm thấy")
    void testGetMovieById_NotFound() {
        // Given
        when(movieRepository.findById(movieId)).thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            movieService.get(movieId);
        });

        assertEquals("movie not exist", exception.getMessage());
        verify(movieRepository, times(1)).findById(movieId);
    }

    @Test
    @DisplayName("Test get movie by id - input null")
    void testGetMovieById_NullInput() {
        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            movieService.get(null);
        });

        assertEquals("invalid input", exception.getMessage());
        verify(movieRepository, never()).findById(anyString());
    }

    @Test
    @DisplayName("Test get movies upcoming - thành công")
    void testGetMovieUpComing_Success() {
        // Given
        String cinemaId = "cinema-id-123";
        LocalDate today = LocalDate.now();
        
        Movie upcomingMovie = Movie.builder()
                .id("upcoming-movie-id")
                .title("Upcoming Movie")
                .dayStart(today.plusDays(7))
                .build();

        List<Movie> movies = Collections.singletonList(upcomingMovie);
        when(movieRepository.findAllByDayStartAfter(today, cinemaId)).thenReturn(movies);

        MovieResponse response = MovieResponse.builder()
                .id("upcoming-movie-id")
                .title("Upcoming Movie")
                .build();
        when(movieMapper.toMovieResponses(movies)).thenReturn(Collections.singletonList(response));

        // When
        List<MovieResponse> result = movieService.getMovieUpComing(cinemaId);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(movieRepository, times(1)).findAllByDayStartAfter(today, cinemaId);
    }

    @Test
    @DisplayName("Test get movies showing - thành công")
    void testGetMoviesShowing_Success() {
        // Given
        String cinemaId = "cinema-id-123";
        LocalDate today = LocalDate.now();
        
        Movie showingMovie = Movie.builder()
                .id("showing-movie-id")
                .title("Showing Movie")
                .dayStart(today.minusDays(5))
                .dayEnd(today.plusDays(10))
                .build();

        List<Movie> movies = Collections.singletonList(showingMovie);
        when(movieRepository.findShowingMovie(today, cinemaId)).thenReturn(movies);

        MovieResponse response = MovieResponse.builder()
                .id("showing-movie-id")
                .title("Showing Movie")
                .build();
        when(movieMapper.toMovieResponses(movies)).thenReturn(Collections.singletonList(response));

        // When
        List<MovieResponse> result = movieService.getMoviesShowing(cinemaId);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(movieRepository, times(1)).findShowingMovie(today, cinemaId);
    }
}

