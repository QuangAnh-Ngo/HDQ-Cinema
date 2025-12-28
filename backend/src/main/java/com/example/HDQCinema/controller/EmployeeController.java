package com.example.HDQCinema.controller;

import com.example.HDQCinema.dto.request.EmployeeCreationRequest;
import com.example.HDQCinema.dto.request.EmployeeUpdateRequest;
import com.example.HDQCinema.dto.response.ApiResponse;
import com.example.HDQCinema.dto.response.EmployeeResponse;
import com.example.HDQCinema.service.EmployeeService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/employees")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class EmployeeController {
    EmployeeService employeeService;

    @PostMapping
    ApiResponse<EmployeeResponse> createEmployee(@RequestBody EmployeeCreationRequest request){
        log.info("Create User");
        return ApiResponse.<EmployeeResponse>builder()
                .result(employeeService.createEmployee(request))
                .build();
    }

    @GetMapping
    ApiResponse<List<EmployeeResponse>> getEmployee(){
        return ApiResponse.<List<EmployeeResponse>>builder()
                .result(employeeService.getEmployee())
                .build();
    }

    @DeleteMapping("/{employeeId}")
    ApiResponse<String> deleteEmployee(@PathVariable String employeeId){
        employeeService.deleteEmployee(employeeId);
        return ApiResponse.<String>builder()
                .result("Delete user successfully")
                .build();
    }

    @PutMapping("/{employeeAccountId}")
    ApiResponse<EmployeeResponse> updateEmployee(@PathVariable String employeeId, @RequestBody EmployeeUpdateRequest request){
        return ApiResponse.<EmployeeResponse>builder()
                .result(employeeService.updateEmployee(employeeId, request))
                .build();
    }
}
