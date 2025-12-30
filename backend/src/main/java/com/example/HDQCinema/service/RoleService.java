package com.example.HDQCinema.service;

import com.example.HDQCinema.dto.request.MemberUpdateRequest;
import com.example.HDQCinema.dto.request.RoleCreationRequest;
import com.example.HDQCinema.dto.request.RoleUpdateRequest;
import com.example.HDQCinema.dto.response.MemberResponse;
import com.example.HDQCinema.dto.response.RoleResponse;
import com.example.HDQCinema.entity.Member;
import com.example.HDQCinema.entity.Permission;
import com.example.HDQCinema.entity.Role;
import com.example.HDQCinema.exception.AppException;
import com.example.HDQCinema.exception.ErrorCode;
import com.example.HDQCinema.mapper.RoleMapper;
import com.example.HDQCinema.repository.PermissionRepository;
import com.example.HDQCinema.repository.RoleRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RoleService {
    RoleRepository roleRepository;
    PermissionRepository permissionRepository;
    RoleMapper roleMapper;

    @PreAuthorize("hasRole('ADMIN')")
    public RoleResponse createRole(RoleCreationRequest request) {
        var role = roleMapper.toRole(request);

        Set<Permission> permissions = new HashSet<>();
        List<String> requestedPermissions = request.getPermissions();

        if (requestedPermissions != null && !requestedPermissions.isEmpty()) {
            for (String permissionName : requestedPermissions) {
                Permission permission = permissionRepository.findByName(permissionName)
                        .orElseThrow(() -> new AppException(ErrorCode.PERMISSION_NOT_FOUND));
                permissions.add(permission);
            }
        }

        role.setPermissions(permissions);

        try {
            roleRepository.save(role);
        } catch (DataIntegrityViolationException exception) {
            throw new AppException(ErrorCode.ROLE_EXISTED);
        }

        return roleMapper.toRoleResponse(role);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public List<RoleResponse> getAll() {
        return roleRepository.findAll().stream().map(roleMapper::toRoleResponse).toList();
    }

    @PreAuthorize("hasRole('ADMIN')")
    public RoleResponse updateRole(String roleId, RoleUpdateRequest request){
        Role role = roleRepository.findById(roleId)
                .orElseThrow(()-> new AppException(ErrorCode.ROLE_NOT_FOUND));

        roleMapper.updateRole(role, request);

        var permisisons = permissionRepository.findAllById(request.getPermissions());
        role.setPermissions(new HashSet<>(permisisons));

        return roleMapper.toRoleResponse(roleRepository.save(role));
    }

    @PreAuthorize("hasRole('ADMIN')")
    public void deleteRole(String role) {
        roleRepository.deleteById(role);
    }
}