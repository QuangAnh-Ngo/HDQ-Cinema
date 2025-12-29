package com.example.HDQCinema.service;

import com.example.HDQCinema.constant.PredefinedRole;
import com.example.HDQCinema.dto.request.EmployeeAccountCreationRequest;
import com.example.HDQCinema.dto.request.EmployeeAccountUpdateRequest;
import com.example.HDQCinema.dto.response.EmployeeAccountResponse;
import com.example.HDQCinema.entity.Employee;
import com.example.HDQCinema.entity.EmployeeAccount;
import com.example.HDQCinema.entity.Role;
import com.example.HDQCinema.exception.AppException;
import com.example.HDQCinema.exception.ErrorCode;
import com.example.HDQCinema.mapper.EmployeeAccountMapper;
import com.example.HDQCinema.repository.EmployeeAccountRepository;
import com.example.HDQCinema.repository.EmployeeRepository;
import com.example.HDQCinema.repository.RoleRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class EmployeeAccountService {
    EmployeeAccountRepository employeeAccountRepository;
    EmployeeAccountMapper employeeAccountMapper;
    RoleRepository roleRepository;
    PasswordEncoder passwordEncoder;
    EmployeeRepository employeeRepository;

    @PreAuthorize("hasRole('ADMIN')")
    public EmployeeAccountResponse createEmployeeAccount(EmployeeAccountCreationRequest request) {
        EmployeeAccount employeeAccount = employeeAccountMapper.toEmployeeAccount(request);

        employeeAccount.setPassword(passwordEncoder.encode(employeeAccount.getPassword()));

        Set<Role> roles = new HashSet<>();
        List<String> requestedRoles = request.getRoles();

        if (requestedRoles != null && !requestedRoles.isEmpty()) {
            for (String roleName : requestedRoles) {
                Role role = roleRepository.findByName(roleName)
                        .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND)); // Nhớ thêm ErrorCode này
                roles.add(role);
            }
        } else {
            Role defaultRole = roleRepository.findByName("USER")
                    .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));
            roles.add(defaultRole);
        }

        employeeAccount.setRoles(roles);

        String employee = request.getEmployee();
        Employee employees = employeeRepository.findById(employee)
                .orElseThrow(() -> new AppException(ErrorCode.EMPLOYEE_NOT_FOUND));
        employeeAccount.setEmployee(employees);

        try {
            employeeAccountRepository.save(employeeAccount);
        } catch (DataIntegrityViolationException exception) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }

        return employeeAccountMapper.toEmployeeAccountResponse(employeeAccount);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public List<EmployeeAccountResponse> getEmployeeAccount(){
        List<EmployeeAccount> users = employeeAccountRepository.findAll();

        return users.stream().map(employeeAccountMapper::toEmployeeAccountResponse)
                .toList();
    }

    @PreAuthorize("hasRole('ADMIN')")
    public EmployeeAccountResponse updateEmployeeAccount(String employeeAccountId, EmployeeAccountUpdateRequest request) {
        EmployeeAccount employeeAccount = employeeAccountRepository.findById(employeeAccountId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        employeeAccountMapper.updateEmployeeAccount(employeeAccount, request);

        employeeAccount.setPassword(passwordEncoder.encode(employeeAccount.getPassword()));

        var rolesRequest = request.getRoles();
        if (rolesRequest != null && !rolesRequest.isEmpty()) {
            Set<Role> newRoles = new HashSet<>();

            for (String roleName : rolesRequest) {
                Role role = roleRepository.findByName(roleName)
                        .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));
                newRoles.add(role);
            }

            employeeAccount.setRoles(newRoles);
        }

        employeeAccount.setEmployee(employeeRepository
                .findById(request.getEmployee())
                .orElseThrow(() -> new AppException(ErrorCode.EMPLOYEE_NOT_FOUND))
                );

        return employeeAccountMapper.toEmployeeAccountResponse(employeeAccountRepository.save(employeeAccount));
    }

    @PreAuthorize("hasRole('ADMIN')")
    public void deleteEmployeeAccount(String employeeAccountId){
        if (!employeeAccountRepository.existsById(employeeAccountId)){
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }
        employeeAccountRepository.deleteById(employeeAccountId);
    }

}
