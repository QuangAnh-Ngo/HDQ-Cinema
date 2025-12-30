package com.example.HDQCinema.service;

import com.example.HDQCinema.dto.request.PermissionCreationRequest;
import com.example.HDQCinema.dto.request.PermissionUpdateRequest;
import com.example.HDQCinema.dto.response.PermissionResponse;
import com.example.HDQCinema.entity.Permission;
import com.example.HDQCinema.exception.AppException;
import com.example.HDQCinema.exception.ErrorCode;
import com.example.HDQCinema.mapper.PermissionMapper;
import com.example.HDQCinema.repository.PermissionRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PermissionService {
    PermissionRepository permissionRepository;
    PermissionMapper permissionMapper;

    @PreAuthorize("hasRole('ADMIN')")
    public PermissionResponse createPermission(PermissionCreationRequest request) {
        Permission permission = permissionMapper.toPermission(request);

        try {
            permissionRepository.save(permission);
        } catch (DataIntegrityViolationException exception) {
            throw new AppException(ErrorCode.PERMISSION_EXISTED);
        }

        return permissionMapper.toPermissionResponse(permission);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public List<PermissionResponse> getPermission() {
        var permissions = permissionRepository.findAll();
        return permissions.stream().map(permissionMapper::toPermissionResponse).toList();
    }

    @PreAuthorize("hasRole('ADMIN')")
    public PermissionResponse updatePermission(String permissionId, PermissionUpdateRequest request) {
        Permission permission = permissionRepository.findById(permissionId)
                .orElseThrow(()-> new AppException(ErrorCode.PERMISSION_NOT_FOUND));

        return permissionMapper.toPermissionResponse(permissionMapper.updatePermission(permission, request));
    }

    @PreAuthorize("hasRole('ADMIN')")
    public void deletePermission(String permission) {
        permissionRepository.deleteById(permission);
    }
}
