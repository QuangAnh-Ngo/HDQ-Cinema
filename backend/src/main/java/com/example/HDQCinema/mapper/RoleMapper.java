package com.example.HDQCinema.mapper;

import com.example.HDQCinema.dto.request.RoleCreationRequest;
import com.example.HDQCinema.dto.request.RoleUpdateRequest;
import com.example.HDQCinema.dto.response.RoleResponse;
import com.example.HDQCinema.entity.Role;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface RoleMapper {
    @Mapping(target = "permissions", ignore = true)
    Role toRole(RoleCreationRequest request);

    RoleResponse toRoleResponse(Role role);

    @Mapping(target = "permissions", ignore = true)
    Role updateRole(@MappingTarget Role role, RoleUpdateRequest updatedRole);
}
