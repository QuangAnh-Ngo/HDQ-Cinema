package com.example.HDQCinema.controller;

import com.example.HDQCinema.dto.request.MovieCreationRequest;
import com.example.HDQCinema.dto.request.MovieUpdateRequest;
import com.example.HDQCinema.dto.request.ShowTimeUpdateRequest;
import com.example.HDQCinema.dto.response.ApiResponse;
import com.example.HDQCinema.dto.response.MovieResponse;
import com.example.HDQCinema.entity.Movie;
import com.example.HDQCinema.service.MovieService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/movies")
public class MovieController {
    @Autowired
    private MovieService movieService;

    @PostMapping
    @PreAuthorize("hasAuthority('MANAGE_MOVIES')")
    ApiResponse<MovieResponse> createMovie(@RequestBody MovieCreationRequest request){
        var movie = movieService.create(request);
        return ApiResponse.<MovieResponse>builder()
                .result(movie)
                .build();
    }

    @GetMapping("/{movieId}")
    ApiResponse<MovieResponse> getMovie(@PathVariable("movieId") Long id){
        var response = movieService.get(id);

        return ApiResponse.<MovieResponse>builder()
                .result(response)
                .build();
    }

    @GetMapping("/upcoming")
    ApiResponse<List<MovieResponse>> getMoviesUpComing(@RequestParam(value = "c") Long cinemaId){
        var response = movieService.getMovieUpComing(cinemaId);
        return ApiResponse.<List<MovieResponse>>builder()
                .result(response)
                .build();
    }

    @GetMapping("/showing")
    ApiResponse<List<MovieResponse>> getMoviesShowing(@RequestParam(value = "c") Long cinemaId){
        var response = movieService.getMoviesShowing(cinemaId);
        return ApiResponse.<List<MovieResponse>>builder()
                .result(response)
                .build();
    }

    @GetMapping
    ApiResponse<List<MovieResponse>> getAllMovies(){
        return ApiResponse.<List<MovieResponse>>builder()
                .result(movieService.getAll())
                .build();
    }

    @PutMapping("/{movieId}")
    @PreAuthorize("hasAuthority('MANAGE_MOVIES')")
    ApiResponse<MovieResponse> updateMovie(@PathVariable("movieId") Long movieId, @RequestBody MovieUpdateRequest request){
        return ApiResponse.<MovieResponse>builder()
                .result(movieService.update(movieId,request))
                .build();
    }
    @DeleteMapping("/{movieId}")
    @PreAuthorize("hasAuthority('MANAGE_MOVIES')")
    ApiResponse<String> deleteMovie(@PathVariable("movieId") Long movieId){
        movieService.deleteMovie(movieId);
        return ApiResponse.<String>builder()
                .result("deleted").build();
    }
}
