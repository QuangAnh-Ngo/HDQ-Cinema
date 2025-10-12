package com.example.HDQCinema.controller;

import com.example.HDQCinema.dto.request.ShowTimeRequest;
import com.example.HDQCinema.dto.response.ApiResponse;
import com.example.HDQCinema.dto.response.ShowTimeResponse;
import com.example.HDQCinema.service.ShowTimeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/showtimes")
public class ShowTimeController {
    @Autowired
    ShowTimeService showTimeService;

    @PostMapping
    ApiResponse<ShowTimeResponse> createShowTime(@RequestBody ShowTimeRequest request){
        var showTime = showTimeService.create(request);

        return ApiResponse.<ShowTimeResponse>builder()
                .result(showTime)
                .build();
    }
}
