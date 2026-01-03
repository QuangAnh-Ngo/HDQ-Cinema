package com.example.HDQCinema.controller;

import com.example.HDQCinema.dto.request.MemberCreationRequest;
import com.example.HDQCinema.dto.request.MemberUpdateRequest;
import com.example.HDQCinema.dto.request.RoleCreationRequest;
import com.example.HDQCinema.dto.request.RoleUpdateRequest;
import com.example.HDQCinema.dto.response.ApiResponse;
import com.example.HDQCinema.dto.response.MemberResponse;
import com.example.HDQCinema.dto.response.RoleResponse;
import com.example.HDQCinema.service.MemberService;
import com.example.HDQCinema.service.RoleService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/roles")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class RoleController {
    RoleService roleService;

    @PostMapping
    ApiResponse<RoleResponse> createRole(@RequestBody RoleCreationRequest request){
        log.info("Create Role");
        return ApiResponse.<RoleResponse>builder()
                .result(roleService.createRole(request))
                .build();
    }

    @GetMapping
    ApiResponse<List<RoleResponse>> getRole(){
        return ApiResponse.<List<RoleResponse>>builder()
                .result(roleService.getAll())
                .build();
    }

    @DeleteMapping("/{employeeId}")
    ApiResponse<String> deleteRole(@PathVariable String employeeId){
        roleService.deleteRole(employeeId);
        return ApiResponse.<String>builder()
                .result("Delete user successfully")
                .build();
    }

    @PutMapping("/{employeeAccountId}")
    ApiResponse<RoleResponse> updateMember(@PathVariable String roleId, @RequestBody RoleUpdateRequest request){
        return ApiResponse.<RoleResponse>builder()
                .result(roleService.updateRole(roleId, request))
                .build();
    }
}
