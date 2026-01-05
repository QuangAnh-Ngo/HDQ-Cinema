package com.example.HDQCinema.controller;

import com.example.HDQCinema.dto.request.CinemaCreationRequest;
import com.example.HDQCinema.dto.response.ApiResponse;
import com.example.HDQCinema.dto.response.CinemaResponse;
import com.example.HDQCinema.entity.Cinema;
import com.example.HDQCinema.service.CinemaService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/theaters")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CinemaController {

    CinemaService cinemaService;

    @PostMapping
    @PreAuthorize("hasAuthority('MANAGE_CINEMAS')")
    ApiResponse<CinemaResponse> createCinema(@RequestBody CinemaCreationRequest request){
        var cinema = cinemaService.create(request);

        return ApiResponse.<CinemaResponse>builder()
                .result(cinema)
                .build();
    }

    @GetMapping("/{cinemaId}")
    ApiResponse<CinemaResponse> getCinema(@PathVariable("cinemaId") String id){
        var cinema = cinemaService.get(id);

        return ApiResponse.<CinemaResponse>builder()
                .result(cinema)
                .build();
    }

    @GetMapping
    ApiResponse<List<CinemaResponse>> getAllCinemas(){
        var response = cinemaService.getAll();
        return ApiResponse.<List<CinemaResponse>>builder()
                .result(response)
                .build();
    }
}
