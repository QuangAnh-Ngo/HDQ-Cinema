package com.example.HDQCinema.controller;

import com.example.HDQCinema.dto.request.DayTypeRequest;
import com.example.HDQCinema.dto.response.ApiResponse;
import com.example.HDQCinema.dto.response.DayTypeResponse;
import com.example.HDQCinema.service.DayTypeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/daytypes")
public class DayTypeController {
    @Autowired
    private DayTypeService dayTypeService;

    @PostMapping
    ApiResponse<DayTypeResponse> createDayType(@RequestBody DayTypeRequest request){
        var response = dayTypeService.create(request);

        return ApiResponse.<DayTypeResponse>builder()
                .result(response)
                .build();
    }
}
