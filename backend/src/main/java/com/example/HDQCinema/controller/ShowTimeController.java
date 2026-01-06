package com.example.HDQCinema.controller;

import com.example.HDQCinema.dto.request.ShowTimeRequest;
import com.example.HDQCinema.dto.request.ShowTimeUpdateRequest;
import com.example.HDQCinema.dto.response.ApiResponse;
import com.example.HDQCinema.dto.response.ShowTimeResponse;
import com.example.HDQCinema.service.ShowTimeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/showtimes")
public class ShowTimeController {
    @Autowired
    ShowTimeService showTimeService;

    @PostMapping
    @PreAuthorize("hasAuthority('MANAGE_SHOWTIMES')")
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
    @PreAuthorize("hasAuthority('MANAGE_SHOWTIMES')")
    ApiResponse<String> deleteShowTime(@PathVariable("showtimeId") Long showtimeId){
        showTimeService.delete(showtimeId);
        return ApiResponse.<String>builder()
                .result("deleted").build();

    }
    @PutMapping("/{showtimeId}")
    @PreAuthorize("hasAuthority('MANAGE_SHOWTIMES')")
    ApiResponse<ShowTimeResponse> updateShowTime(@PathVariable("showtimeId") Long showtimeId, @RequestBody ShowTimeUpdateRequest request){
        return ApiResponse.<ShowTimeResponse>builder()
                .result(showTimeService.update(showtimeId, request))
                .build();
    }

}
