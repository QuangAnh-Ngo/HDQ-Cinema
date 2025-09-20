package com.example.HDQCinema.controller;

import com.example.HDQCinema.dto.request.CinemaCreationRequest;
import com.example.HDQCinema.dto.response.ApiResponse;
import com.example.HDQCinema.dto.response.CinemaResponse;
import com.example.HDQCinema.entity.Cinema;
import com.example.HDQCinema.service.CinemaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/theaters")
public class CinemaController {
    @Autowired
    private CinemaService cinemaService;

    @PostMapping
    ApiResponse<CinemaResponse> createCinema(CinemaCreationRequest request){
        var cinema = cinemaService.create(request);

        return ApiResponse.<CinemaResponse>builder()
                .result(cinema)
                .build();
    }
}
