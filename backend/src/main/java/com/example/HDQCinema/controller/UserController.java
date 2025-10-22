package com.example.HDQCinema.controller;

import com.example.HDQCinema.dto.request.UserCreationRequest;
import com.example.HDQCinema.dto.response.ApiResponse;
import com.example.HDQCinema.dto.response.UserResponse;
import com.example.HDQCinema.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/members")
public class UserController {
    @Autowired
    UserService userService;

    @PostMapping
    ApiResponse<UserResponse> createUser(@RequestBody UserCreationRequest request){
        var response = userService.createUser(request);

        return ApiResponse.<UserResponse>builder()
                .result(response)
                .build();
    }
}
