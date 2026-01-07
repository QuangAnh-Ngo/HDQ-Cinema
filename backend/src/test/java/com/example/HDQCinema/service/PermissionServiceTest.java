package com.example.HDQCinema.service;

import com.example.HDQCinema.dto.request.PermissionCreationRequest;
import com.example.HDQCinema.dto.request.PermissionUpdateRequest;
import com.example.HDQCinema.dto.response.PermissionResponse;
import com.example.HDQCinema.entity.Permission;
import com.example.HDQCinema.exception.AppException;
import com.example.HDQCinema.exception.ErrorCode;
import com.example.HDQCinema.mapper.PermissionMapper;
import com.example.HDQCinema.repository.PermissionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("PermissionService Unit Tests")
class PermissionServiceTest {

    @Mock
    private PermissionRepository permissionRepository;

    @Mock
    private PermissionMapper permissionMapper;

    @InjectMocks
    private PermissionService permissionService;

    private PermissionCreationRequest creationRequest;
    private PermissionUpdateRequest updateRequest;
    private Permission permission;
    private PermissionResponse permissionResponse;
    private Long permissionId;

    @BeforeEach
    void setUp() {
        permissionId = 1L;

        creationRequest = PermissionCreationRequest.builder()
                .name("READ")
                .description("Read permission")
                .build();

        permission = Permission.builder()
                .id(permissionId)
                .name("READ")
                .description("Read permission")
                .build();

        permissionResponse = PermissionResponse.builder()
                .name("READ")
                .description("Read permission")
                .build();

        updateRequest = PermissionUpdateRequest.builder()
                .name("WRITE")
                .description("Write permission")
                .build();
    }

    @Test
    @DisplayName("Test create permission - thành công")
    void testCreatePermission_Success() {
        // Given
        when(permissionMapper.toPermission(any(PermissionCreationRequest.class))).thenReturn(permission);
        when(permissionRepository.save(any(Permission.class))).thenReturn(permission);
        when(permissionMapper.toPermissionResponse(any(Permission.class))).thenReturn(permissionResponse);

        // When
        PermissionResponse result = permissionService.createPermission(creationRequest);

        // Then
        assertNotNull(result);
        assertEquals("READ", result.getName());
        verify(permissionMapper, times(1)).toPermission(creationRequest);
        verify(permissionRepository, times(1)).save(permission);
        verify(permissionMapper, times(1)).toPermissionResponse(permission);
    }

    @Test
    @DisplayName("Test create permission - permission đã tồn tại")
    void testCreatePermission_PermissionExisted() {
        // Given
        when(permissionMapper.toPermission(any(PermissionCreationRequest.class))).thenReturn(permission);
        when(permissionRepository.save(any(Permission.class)))
                .thenThrow(new DataIntegrityViolationException("Permission already exists"));

        // When & Then
        AppException exception = assertThrows(AppException.class, () -> {
            permissionService.createPermission(creationRequest);
        });

        assertEquals(ErrorCode.PERMISSION_EXISTED, exception.getErrorCode());
    }

    @Test
    @DisplayName("Test get all permissions - thành công")
    void testGetPermission_Success() {
        // Given
        List<Permission> permissions = Arrays.asList(permission);
        when(permissionRepository.findAll()).thenReturn(permissions);
        when(permissionMapper.toPermissionResponse(any(Permission.class))).thenReturn(permissionResponse);

        // When
        List<PermissionResponse> result = permissionService.getPermission();

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(permissionRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("Test update permission - thành công")
    void testUpdatePermission_Success() {
        // Given
        Permission updatedPermission = Permission.builder()
                .id(permissionId)
                .name("WRITE")
                .description("Write permission")
                .build();

        PermissionResponse updatedResponse = PermissionResponse.builder()
                .name("WRITE")
                .description("Write permission")
                .build();

        when(permissionRepository.findById(String.valueOf(permissionId))).thenReturn(Optional.of(permission));
        when(permissionMapper.updatePermission(any(Permission.class), any(PermissionUpdateRequest.class)))
                .thenReturn(updatedPermission);
        when(permissionMapper.toPermissionResponse(any(Permission.class))).thenReturn(updatedResponse);

        // When
        PermissionResponse result = permissionService.updatePermission(String.valueOf(permissionId), updateRequest);

        // Then
        assertNotNull(result);
        assertEquals("WRITE", result.getName());
        verify(permissionRepository, times(1)).findById(String.valueOf(permissionId));
    }

    @Test
    @DisplayName("Test update permission - permission không tồn tại")
    void testUpdatePermission_PermissionNotFound() {
        // Given
        when(permissionRepository.findById(String.valueOf(permissionId))).thenReturn(Optional.empty());

        // When & Then
        AppException exception = assertThrows(AppException.class, () -> {
            permissionService.updatePermission(String.valueOf(permissionId), updateRequest);
        });

        assertEquals(ErrorCode.PERMISSION_NOT_FOUND, exception.getErrorCode());
        verify(permissionRepository, times(1)).findById(String.valueOf(permissionId));
    }

    @Test
    @DisplayName("Test delete permission - thành công")
    void testDeletePermission_Success() {
        // Given
        doNothing().when(permissionRepository).deleteById(String.valueOf(permissionId));

        // When
        permissionService.deletePermission(String.valueOf(permissionId));

        // Then
        verify(permissionRepository, times(1)).deleteById(String.valueOf(permissionId));
    }
}

