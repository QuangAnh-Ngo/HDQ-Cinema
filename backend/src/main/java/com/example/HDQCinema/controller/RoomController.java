package com.example.HDQCinema.controller;

import com.example.HDQCinema.dto.request.RoomRequest;
import com.example.HDQCinema.dto.response.ApiResponse;
import com.example.HDQCinema.dto.response.RoomResponse;
import com.example.HDQCinema.service.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
