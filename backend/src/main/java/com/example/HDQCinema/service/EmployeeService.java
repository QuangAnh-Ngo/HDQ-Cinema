package com.example.HDQCinema.service;

import com.example.HDQCinema.dto.request.EmployeeCreationRequest;
import com.example.HDQCinema.dto.request.EmployeeUpdateRequest;
import com.example.HDQCinema.dto.response.EmployeeResponse;
import com.example.HDQCinema.entity.Employee;
import com.example.HDQCinema.exception.AppException;
import com.example.HDQCinema.exception.ErrorCode;
import com.example.HDQCinema.mapper.EmployeeMapper;
import com.example.HDQCinema.repository.EmployeeRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class EmployeeService {
    EmployeeRepository  employeeRepository;
    EmployeeMapper employeeMapper;
    
    @PreAuthorize("hasRole('ADMIN')")
    public EmployeeResponse createEmployee(EmployeeCreationRequest request){
        Employee employee = employeeMapper.toEmployee(request);


        employeeRepository.save(employee);
        return employeeMapper.toEmployeeResponse(employee);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public List<EmployeeResponse> getEmployee(){
        List<Employee> users = employeeRepository.findAll();

        return users.stream().map(employeeMapper::toEmployeeResponse)
                .toList();
    }

    @PreAuthorize("hasRole('ADMIN')")
    public EmployeeResponse updateEmployee(String employeeId, EmployeeUpdateRequest request){
        Employee user = employeeRepository.findById(employeeId)
                .orElseThrow(()-> new AppException(ErrorCode.USER_NOT_FOUND));

        return employeeMapper.toEmployeeResponse(employeeMapper.updateEmployee(user, request));
    }

    @PreAuthorize("hasRole('ADMIN')")
    public void deleteEmployee(String employeeId){
        if (!employeeRepository.existsById(employeeId)){
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }
        employeeRepository.deleteById(employeeId);
    }

}
