package com.example.HDQCinema.controller;

import com.example.HDQCinema.dto.request.EmployeeAccountCreationRequest;
import com.example.HDQCinema.dto.request.EmployeeAccountUpdateRequest;
import com.example.HDQCinema.dto.response.ApiResponse;
import com.example.HDQCinema.dto.response.EmployeeAccountResponse;
import com.example.HDQCinema.service.EmployeeAccountService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/accounts")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class EmployeeAccountController {
    EmployeeAccountService employeeAccountService;

    @PostMapping
    ApiResponse<EmployeeAccountResponse> createEmployeeAccount(@RequestBody EmployeeAccountCreationRequest request){
        log.info("Create User");
        return ApiResponse.<EmployeeAccountResponse>builder()
                .result(employeeAccountService.createEmployeeAccount(request))
                .build();
    }

    @GetMapping
    ApiResponse<List<EmployeeAccountResponse>> getEmployeeAccount(){
        return ApiResponse.<List<EmployeeAccountResponse>>builder()
                .result(employeeAccountService.getEmployeeAccount())
                .build();
    }

    @DeleteMapping("/{employeeAccountId}")
    ApiResponse<String> deleteEmployeeAccount(@PathVariable String employeeAccountId){
        employeeAccountService.deleteEmployeeAccount(employeeAccountId);
        return ApiResponse.<String>builder()
                .result("Delete user successfully")
                .build();
    }

    @PutMapping("/{employeeAccountId}")
    ApiResponse<EmployeeAccountResponse> updateEmployeeAccount(@PathVariable String employeeAccountId, @RequestBody EmployeeAccountUpdateRequest request){
        return ApiResponse.<EmployeeAccountResponse>builder()
                .result(employeeAccountService.updateEmployeeAccount(employeeAccountId, request))
                .build();
    }
}
