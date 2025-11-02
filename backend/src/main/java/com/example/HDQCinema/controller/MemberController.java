package com.example.HDQCinema.controller;

import com.example.HDQCinema.dto.request.MemberCreationRequest;
import com.example.HDQCinema.dto.response.ApiResponse;
import com.example.HDQCinema.dto.response.MemberResponse;
import com.example.HDQCinema.service.MemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/members")
public class MemberController {
    @Autowired
    MemberService userService;

    @PostMapping
    ApiResponse<MemberResponse> createUser(@RequestBody MemberCreationRequest request){
        var response = userService.createUser(request);

        return ApiResponse.<MemberResponse>builder()
                .result(response)
                .build();
    }
}
