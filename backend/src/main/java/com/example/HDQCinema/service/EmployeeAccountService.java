package com.example.HDQCinema.service;

import com.example.HDQCinema.constant.PredefinedRole;
import com.example.HDQCinema.dto.request.EmployeeAccountCreationRequest;
import com.example.HDQCinema.dto.request.EmployeeAccountUpdateRequest;
import com.example.HDQCinema.dto.response.EmployeeAccountResponse;
import com.example.HDQCinema.entity.EmployeeAccount;
import com.example.HDQCinema.entity.Role;
import com.example.HDQCinema.exception.AppException;
import com.example.HDQCinema.exception.ErrorCode;
import com.example.HDQCinema.mapper.EmployeeAccountMapper;
import com.example.HDQCinema.repository.EmployeeAccountRepository;
import com.example.HDQCinema.repository.RoleRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
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

    @PreAuthorize("hasRole('ADMIN')")
    public EmployeeAccountResponse createEmployeeAccount(EmployeeAccountCreationRequest request){
        EmployeeAccount employeeAccount = employeeAccountMapper.toEmployeeAccount(request);

        employeeAccount.setPassword(passwordEncoder.encode(employeeAccount.getPassword()));

        Set<Role> roles = new HashSet<>();
        roles.add(roleRepository.findByName("USER").orElseThrow(()-> new AppException(ErrorCode.USER_NOT_FOUND)));
        employeeAccount.setRoles(roles);

        employeeAccountRepository.save(employeeAccount);
        return employeeAccountMapper.toEmployeeAccountResponse(employeeAccount);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public List<EmployeeAccountResponse> getEmployeeAccount(){
        List<EmployeeAccount> users = employeeAccountRepository.findAll();

        return users.stream().map(employeeAccountMapper::toEmployeeAccountResponse)
                .toList();
    }

    @PreAuthorize("hasRole('ADMIN')")
    public EmployeeAccountResponse updateEmployeeAccount(String employeeAccountId, EmployeeAccountUpdateRequest request){
        EmployeeAccount user = employeeAccountRepository.findById(employeeAccountId)
                .orElseThrow(()-> new AppException(ErrorCode.USER_NOT_FOUND));

        return employeeAccountMapper.toEmployeeAccountResponse(employeeAccountMapper.updateEmployeeAccount(user, request));
    }

    @PreAuthorize("hasRole('ADMIN')")
    public void deleteEmployeeAccount(String employeeAccountId){
        if (!employeeAccountRepository.existsById(employeeAccountId)){
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }
        employeeAccountRepository.deleteById(employeeAccountId);
    }

}
