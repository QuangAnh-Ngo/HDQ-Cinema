package com.example.HDQCinema.service;

import com.example.HDQCinema.dto.request.RoleCreationRequest;
import com.example.HDQCinema.dto.request.RoleUpdateRequest;
import com.example.HDQCinema.dto.response.RoleResponse;
import com.example.HDQCinema.entity.Permission;
import com.example.HDQCinema.entity.Role;
import com.example.HDQCinema.exception.AppException;
import com.example.HDQCinema.exception.ErrorCode;
import com.example.HDQCinema.mapper.RoleMapper;
import com.example.HDQCinema.repository.PermissionRepository;
import com.example.HDQCinema.repository.RoleRepository;
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
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("RoleService Unit Tests")
class RoleServiceTest {

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private PermissionRepository permissionRepository;

    @Mock
    private RoleMapper roleMapper;

    @InjectMocks
    private RoleService roleService;

    private RoleCreationRequest creationRequest;
    private RoleUpdateRequest updateRequest;
    private Role role;
    private RoleResponse roleResponse;
    private Permission permission;
    private Long roleId;

    @BeforeEach
    void setUp() {
        roleId = 1L;

        permission = Permission.builder()
                .id(1L)
                .name("READ")
                .description("Read permission")
                .build();

        creationRequest = RoleCreationRequest.builder()
                .name("MANAGER")
                .description("Manager role")
                .permissions(Arrays.asList("READ", "WRITE"))
                .build();

        role = Role.builder()
                .id(roleId)
                .name("MANAGER")
                .description("Manager role")
                .permissions(new HashSet<>(Collections.singletonList(permission)))
                .build();

        roleResponse = RoleResponse.builder()
                .name("MANAGER")
                .description("Manager role")
                .build();

        updateRequest = RoleUpdateRequest.builder()
                .name("ADMIN")
                .description("Admin role")
                .permissions(Arrays.asList("1", "2"))
                .build();
    }

    @Test
    @DisplayName("Test create role - thành công với permissions")
    void testCreateRole_SuccessWithPermissions() {
        // Given
        Permission writePermission = Permission.builder()
                .id(2L)
                .name("WRITE")
                .build();

        when(roleMapper.toRole(any(RoleCreationRequest.class))).thenReturn(role);
        when(permissionRepository.findByName("READ")).thenReturn(Optional.of(permission));
        when(permissionRepository.findByName("WRITE")).thenReturn(Optional.of(writePermission));
        when(roleRepository.save(any(Role.class))).thenReturn(role);
        when(roleMapper.toRoleResponse(any(Role.class))).thenReturn(roleResponse);

        // When
        RoleResponse result = roleService.createRole(creationRequest);

        // Then
        assertNotNull(result);
        assertEquals("MANAGER", result.getName());
        verify(permissionRepository, times(1)).findByName("READ");
        verify(permissionRepository, times(1)).findByName("WRITE");
        verify(roleRepository, times(1)).save(any(Role.class));
    }

    @Test
    @DisplayName("Test create role - thành công không có permissions")
    void testCreateRole_SuccessWithoutPermissions() {
        // Given
        RoleCreationRequest requestWithoutPermissions = RoleCreationRequest.builder()
                .name("EMPLOYEE")
                .description("Employee role")
                .permissions(null)
                .build();

        when(roleMapper.toRole(any(RoleCreationRequest.class))).thenReturn(role);
        when(roleRepository.save(any(Role.class))).thenReturn(role);
        when(roleMapper.toRoleResponse(any(Role.class))).thenReturn(roleResponse);

        // When
        RoleResponse result = roleService.createRole(requestWithoutPermissions);

        // Then
        assertNotNull(result);
        verify(permissionRepository, never()).findByName(anyString());
    }

    @Test
    @DisplayName("Test create role - permission không tồn tại")
    void testCreateRole_PermissionNotFound() {
        // Given
        when(roleMapper.toRole(any(RoleCreationRequest.class))).thenReturn(role);
        when(permissionRepository.findByName("READ")).thenReturn(Optional.empty());

        // When & Then
        AppException exception = assertThrows(AppException.class, () -> {
            roleService.createRole(creationRequest);
        });

        assertEquals(ErrorCode.PERMISSION_NOT_FOUND, exception.getErrorCode());
    }

    @Test
    @DisplayName("Test create role - role đã tồn tại")
    void testCreateRole_RoleExisted() {
        // Given
        when(roleMapper.toRole(any(RoleCreationRequest.class))).thenReturn(role);
        when(permissionRepository.findByName(anyString())).thenReturn(Optional.of(permission));
        when(roleRepository.save(any(Role.class)))
                .thenThrow(new DataIntegrityViolationException("Role already exists"));

        // When & Then
        AppException exception = assertThrows(AppException.class, () -> {
            roleService.createRole(creationRequest);
        });

        assertEquals(ErrorCode.ROLE_EXISTED, exception.getErrorCode());
    }

    @Test
    @DisplayName("Test get all roles - thành công")
    void testGetAll_Success() {
        // Given
        List<Role> roles = Arrays.asList(role);
        when(roleRepository.findAll()).thenReturn(roles);
        when(roleMapper.toRoleResponse(any(Role.class))).thenReturn(roleResponse);

        // When
        List<RoleResponse> result = roleService.getAll();

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(roleRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("Test update role - thành công")
    void testUpdateRole_Success() {
        // Given
        Permission permission2 = Permission.builder()
                .id(2L)
                .name("DELETE")
                .build();

        List<Permission> permissions = Arrays.asList(permission, permission2);
        when(roleRepository.findById(String.valueOf(roleId))).thenReturn(Optional.of(role));
        when(permissionRepository.findAllById(anyList())).thenReturn(permissions);
        when(roleRepository.save(any(Role.class))).thenReturn(role);
        when(roleMapper.toRoleResponse(any(Role.class))).thenReturn(roleResponse);

        // When
        RoleResponse result = roleService.updateRole(String.valueOf(roleId), updateRequest);

        // Then
        assertNotNull(result);
        verify(roleRepository, times(1)).findById(String.valueOf(roleId));
        verify(roleRepository, times(1)).save(any(Role.class));
    }

    @Test
    @DisplayName("Test update role - role không tồn tại")
    void testUpdateRole_RoleNotFound() {
        // Given
        when(roleRepository.findById(String.valueOf(roleId))).thenReturn(Optional.empty());

        // When & Then
        AppException exception = assertThrows(AppException.class, () -> {
            roleService.updateRole(String.valueOf(roleId), updateRequest);
        });

        assertEquals(ErrorCode.ROLE_NOT_FOUND, exception.getErrorCode());
    }

    @Test
    @DisplayName("Test delete role - thành công")
    void testDeleteRole_Success() {
        // Given
        doNothing().when(roleRepository).deleteById(String.valueOf(roleId));

        // When
        roleService.deleteRole(String.valueOf(roleId));

        // Then
        verify(roleRepository, times(1)).deleteById(String.valueOf(roleId));
    }
}

