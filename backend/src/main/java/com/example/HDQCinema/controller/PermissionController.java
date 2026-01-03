package com.example.HDQCinema.controller;

import com.example.HDQCinema.dto.request.PermissionCreationRequest;
import com.example.HDQCinema.dto.request.PermissionUpdateRequest;
import com.example.HDQCinema.dto.response.ApiResponse;
import com.example.HDQCinema.dto.response.PermissionResponse;
import com.example.HDQCinema.service.PermissionService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/permissions")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class PermissionController {
    PermissionService permissionService;

    @PostMapping
    ApiResponse<PermissionResponse> createPermission(@RequestBody PermissionCreationRequest request){
        log.info("Create Permission");
        return ApiResponse.<PermissionResponse>builder()
                .result(permissionService.createPermission(request))
                .build();
    }

    @GetMapping
    ApiResponse<List<PermissionResponse>> getPermission(){
        return ApiResponse.<List<PermissionResponse>>builder()
                .result(permissionService.getPermission())
                .build();
    }

    @DeleteMapping("/{employeeId}")
    ApiResponse<String> deletePermission(@PathVariable String employeeId){
        permissionService.deletePermission(employeeId);
        return ApiResponse.<String>builder()
                .result("Delete user successfully")
                .build();
    }

    @PutMapping("/{employeeAccountId}")
    ApiResponse<PermissionResponse> updatePermission(@PathVariable String permissionId, @RequestBody PermissionUpdateRequest request){
        return ApiResponse.<PermissionResponse>builder()
                .result(permissionService.updatePermission(permissionId, request))
                .build();
    }
}
