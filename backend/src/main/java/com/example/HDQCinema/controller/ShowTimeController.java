package com.example.HDQCinema.controller;

import com.example.HDQCinema.dto.request.ShowTimeRequest;
import com.example.HDQCinema.dto.request.ShowTimeUpdateRequest;
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
    ApiResponse<List<ShowTimeResponse>> createShowTime(@RequestBody ShowTimeRequest request){
        var showTime = showTimeService.create(request);

        return ApiResponse.<List<ShowTimeResponse>  >builder()
                .result(showTime)
                .build();
    }

    @GetMapping
    ApiResponse<List<ShowTimeResponse>> getAllShowTime(){
        return ApiResponse.<List<ShowTimeResponse>>builder()
                .result(showTimeService.getAll())
                .build();
    }

    @DeleteMapping("/{showtimeId}")
    ApiResponse<String> deleteShowTime(@PathVariable("showtimeId") String showtimeId){
        showTimeService.delete(showtimeId);
        return ApiResponse.<String>builder()
                .result("deleted").build();

    }
    @PutMapping("/{showtimeId}")
    ApiResponse<ShowTimeResponse> updateShowTime(@PathVariable("showtimeId") String showtimeId, @RequestBody ShowTimeUpdateRequest request){
        return ApiResponse.<ShowTimeResponse>builder()
                .result(showTimeService.update(showtimeId, request))
                .build();
    }

}
