package com.example.HDQCinema.mapper;

import com.example.HDQCinema.dto.request.EmployeeAccountCreationRequest;
import com.example.HDQCinema.dto.request.EmployeeAccountUpdateRequest;
import com.example.HDQCinema.dto.response.EmployeeAccountResponse;
import com.example.HDQCinema.entity.EmployeeAccount;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface EmployeeAccountMapper {
    @Mapping(target = "roles", ignore = true)
    @Mapping(target = "employee", ignore = true)
    EmployeeAccount toEmployeeAccount(EmployeeAccountCreationRequest employeeAccountResponse);
    EmployeeAccountResponse toEmployeeAccountResponse(EmployeeAccount employeeAccount);

    @Mapping(target = "roles", ignore = true)
    @Mapping(target = "employee", ignore = true)
    EmployeeAccount updateEmployeeAccount(@MappingTarget EmployeeAccount employeeAccount, EmployeeAccountUpdateRequest request);
}
