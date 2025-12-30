package com.example.HDQCinema.mapper;

import com.example.HDQCinema.dto.request.PermissionCreationRequest;
import com.example.HDQCinema.dto.request.PermissionUpdateRequest;
import com.example.HDQCinema.dto.response.PermissionResponse;
import com.example.HDQCinema.entity.Permission;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface PermissionMapper {
    Permission toPermission(PermissionCreationRequest request);

    PermissionResponse toPermissionResponse(Permission permission);

    Permission updatePermission(@MappingTarget Permission permission, PermissionUpdateRequest request);
}