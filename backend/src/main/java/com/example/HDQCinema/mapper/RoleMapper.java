package com.example.HDQCinema.mapper;

import com.example.HDQCinema.dto.request.RoleRequest;
import com.example.HDQCinema.dto.response.RoleResponse;
import com.example.HDQCinema.entity.Role;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface RoleMapper {
    @Mapping(target = "permissions", ignore = true)
    Role toRole(RoleRequest request);

    RoleResponse toRoleResponse(Role role);
}
