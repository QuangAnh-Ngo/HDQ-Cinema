package com.example.HDQCinema.controller;

import com.example.HDQCinema.dto.request.RoomRequest;
import com.example.HDQCinema.dto.response.ApiResponse;
import com.example.HDQCinema.dto.response.RoomForShowTimeResponse;
import com.example.HDQCinema.dto.response.RoomResponse;
import com.example.HDQCinema.service.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.repository.query.Param;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/rooms")
public class RoomController {
    @Autowired
    private RoomService roomService;

    @PostMapping
    ApiResponse<RoomResponse> createRoom(@RequestBody RoomRequest request){
        var cinema = roomService.create(request);

        return ApiResponse.<RoomResponse>builder()
                .result(cinema)
                .build();
    }

    @GetMapping
    ApiResponse<RoomForShowTimeResponse> getRoom(@RequestParam String roomId,
                                                 @RequestParam String showtimeId){
        return ApiResponse.<RoomForShowTimeResponse>builder()
                .result(roomService.get(roomId, showtimeId))
                .build();
    }
}
