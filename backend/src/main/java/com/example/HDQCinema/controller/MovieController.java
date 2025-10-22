package com.example.HDQCinema.controller;

import com.example.HDQCinema.dto.request.MovieCreationRequest;
import com.example.HDQCinema.dto.response.ApiResponse;
import com.example.HDQCinema.dto.response.MovieResponse;
import com.example.HDQCinema.entity.Movie;
import com.example.HDQCinema.service.MovieService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/movies")
public class MovieController {
    @Autowired
    private MovieService movieService;

    @PostMapping
    ApiResponse<MovieResponse> createMovie(@RequestBody MovieCreationRequest request){
        var movie = movieService.create(request);
        return ApiResponse.<MovieResponse>builder()
                .result(movie)
                .build();
    }

    @GetMapping("/{movieId}")
    ApiResponse<MovieResponse> getMovie(@PathVariable("movieId") String id){
        var response = movieService.get(id);

        return ApiResponse.<MovieResponse>builder()
                .result(response)
                .build();
    }

    @GetMapping("/upcoming")
    ApiResponse<List<MovieResponse>> getMoviesUpComing(){
        var response = movieService.getMovieUpComing();
        return ApiResponse.<List<MovieResponse>>builder()
                .result(response)
                .build();
    }

    @GetMapping("/showing")
    ApiResponse<List<MovieResponse>> getMoviesShowing(){
        var response = movieService.getMoviesShowing();
        return ApiResponse.<List<MovieResponse>>builder()
                .result(response)
                .build();
    }
}
