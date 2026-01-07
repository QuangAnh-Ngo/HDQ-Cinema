package com.example.HDQCinema.service;

import com.example.HDQCinema.dto.request.EmployeeCreationRequest;
import com.example.HDQCinema.dto.request.EmployeeUpdateRequest;
import com.example.HDQCinema.dto.response.EmployeeResponse;
import com.example.HDQCinema.entity.Employee;
import com.example.HDQCinema.exception.AppException;
import com.example.HDQCinema.exception.ErrorCode;
import com.example.HDQCinema.mapper.EmployeeMapper;
import com.example.HDQCinema.repository.EmployeeAccountRepository;
import com.example.HDQCinema.repository.EmployeeRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class EmployeeService {
    EmployeeRepository employeeRepository;
    EmployeeAccountRepository employeeAccountRepository;
    EmployeeMapper employeeMapper;

    // ✅ FIX: Cho phép MANAGER và ADMIN
    @PreAuthorize("hasAuthority('MANAGE_EMPLOYEES')")
    public EmployeeResponse createEmployee(EmployeeCreationRequest request) {
        Employee employee = employeeMapper.toEmployee(request);
        employeeRepository.save(employee);
        return employeeMapper.toEmployeeResponse(employee);
    }

    // ✅ FIX: Cho phép MANAGER và ADMIN xem danh sách
    @PreAuthorize("hasAuthority('MANAGE_EMPLOYEES')")
    public List<EmployeeResponse> getEmployee() {
        List<Employee> users = employeeRepository.findAll();
        return users.stream().map(employeeMapper::toEmployeeResponse).toList();
    }

    // ✅ FIX: Cho phép MANAGER và ADMIN
    @PreAuthorize("hasAuthority('MANAGE_EMPLOYEES')")
    public EmployeeResponse updateEmployee(Long employeeId, EmployeeUpdateRequest request) {
        Employee user = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new AppException(ErrorCode.EMPLOYEE_NOT_FOUND));

        return employeeMapper.toEmployeeResponse(employeeMapper.updateEmployee(user, request));
    }

    // ✅ FIX: Cho phép MANAGER và ADMIN
    @PreAuthorize("hasAuthority('MANAGE_EMPLOYEES')")
    public void deleteEmployee(Long employeeId) {
        if (!employeeRepository.existsById(employeeId)) {
            throw new AppException(ErrorCode.EMPLOYEE_NOT_FOUND);
        }
        
        // Xóa account liên kết trước (nếu có)
        employeeAccountRepository.findByEmployeeId(employeeId)
                .ifPresent(account -> employeeAccountRepository.delete(account));
        
        employeeRepository.deleteById(employeeId);
    }
}