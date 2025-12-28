package com.example.HDQCinema.controller;


import com.example.HDQCinema.dto.request.MemberCreationRequest;
import com.example.HDQCinema.dto.request.MemberUpdateRequest;
import com.example.HDQCinema.dto.response.ApiResponse;
import com.example.HDQCinema.dto.response.MemberResponse;
import com.example.HDQCinema.service.MemberService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/members")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class MemberController {
    MemberService memberService;
    
    @PostMapping
    ApiResponse<MemberResponse> createEmployee(@RequestBody MemberCreationRequest request){
        log.info("Create User");
        return ApiResponse.<MemberResponse>builder()
                .result(memberService.createMember(request))
                .build();
    }

    @GetMapping
    ApiResponse<List<MemberResponse>> getEmployee(){
        return ApiResponse.<List<MemberResponse>>builder()
                .result(memberService.getEmployee())
                .build();
    }

    @DeleteMapping("/{employeeId}")
    ApiResponse<String> deleteEmployee(@PathVariable String employeeId){
        memberService.deleteEmployee(employeeId);
        return ApiResponse.<String>builder()
                .result("Delete user successfully")
                .build();
    }

    @PutMapping("/{employeeAccountId}")
    ApiResponse<MemberResponse> updateEmployee(@PathVariable String memberId, @RequestBody MemberUpdateRequest request){
        return ApiResponse.<MemberResponse>builder()
                .result(memberService.updateMember(memberId, request))
                .build();
    }
}
