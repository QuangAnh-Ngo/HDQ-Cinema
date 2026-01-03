package com.example.HDQCinema.mapper;

import com.example.HDQCinema.dto.request.EmployeeCreationRequest;
import com.example.HDQCinema.dto.request.EmployeeUpdateRequest;
import com.example.HDQCinema.dto.response.EmployeeResponse;
import com.example.HDQCinema.entity.Employee;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface EmployeeMapper {
    Employee toEmployee(EmployeeCreationRequest request);
    EmployeeResponse toEmployeeResponse(Employee employee);
    Employee updateEmployee(@MappingTarget Employee employee, EmployeeUpdateRequest request);
}
