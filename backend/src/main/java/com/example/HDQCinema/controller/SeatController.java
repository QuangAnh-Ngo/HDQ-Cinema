package com.example.HDQCinema.controller;

import com.example.HDQCinema.dto.request.SeatCreationRequest;
import com.example.HDQCinema.dto.response.ApiResponse;
import com.example.HDQCinema.dto.response.SeatCreationResponse;
import com.example.HDQCinema.service.SeatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/seats")
public class SeatController {
    @Autowired
    private SeatService seatService;

    @PostMapping
    ApiResponse<SeatCreationResponse> createSeats(@RequestBody SeatCreationRequest request){
        return ApiResponse.<SeatCreationResponse>builder()
                .result(seatService.create(request))
                .build();
    }
}
