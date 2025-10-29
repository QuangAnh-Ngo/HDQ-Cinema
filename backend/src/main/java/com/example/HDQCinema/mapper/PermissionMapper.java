package com.example.HDQCinema.mapper;

import com.example.HDQCinema.dto.request.PermissionRequest;
import com.example.HDQCinema.dto.response.PermissionResponse;
import com.example.HDQCinema.entity.Permission;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PermissionMapper {
    Permission toPermission(PermissionRequest request);

    PermissionResponse toPermissionResponse(Permission permission);
}