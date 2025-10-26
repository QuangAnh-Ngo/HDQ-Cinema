package com.example.HDQCinema.service;

import com.example.HDQCinema.dto.request.EmployeeAccountCreationRequest;
import com.example.HDQCinema.dto.request.EmployeeAccountUpdateRequest;
import com.example.HDQCinema.dto.response.EmployeeAccountResponse;
import com.example.HDQCinema.entity.EmployeeAccount;
import com.example.HDQCinema.exception.AppException;
import com.example.HDQCinema.exception.ErrorCode;
import com.example.HDQCinema.mapper.EmployeeAccountMapper;
import com.example.HDQCinema.repository.EmployeeAccountRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class EmployeeAccountService {
    EmployeeAccountRepository employeeAccountRepository;
    EmployeeAccountMapper empployeeAccountMapper;
    PasswordEncoder passwordEncoder;

    public EmployeeAccountResponse createEmployeeAccount(EmployeeAccountCreationRequest request){
        EmployeeAccount employeeAccount = empployeeAccountMapper.toEmployeeAccount(request);

        employeeAccount.setPassword(passwordEncoder.encode(employeeAccount.getPassword()));

        employeeAccountRepository.save(employeeAccount);
        return empployeeAccountMapper.toEmployeeAccountResponse(employeeAccount);
    }

    public List<EmployeeAccountResponse> getEmployeeAccount(){
        List<EmployeeAccount> users = employeeAccountRepository.findAll();

        return users.stream().map(empployeeAccountMapper::toEmployeeAccountResponse)
                .toList();
    }

    public EmployeeAccountResponse updateEmployeeAccount(String employeeAccountId, EmployeeAccountUpdateRequest request){
        EmployeeAccount user = employeeAccountRepository.findById(employeeAccountId)
                .orElseThrow(()-> new AppException(ErrorCode.USER_NOT_FOUND));

        return empployeeAccountMapper.toEmployeeAccountResponse(empployeeAccountMapper.updateEmployeeAccount(user, request));
    }

    public void deleteEmployeeAccount(String employeeAccountId){
        if (!employeeAccountRepository.existsById(employeeAccountId)){
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }
        employeeAccountRepository.deleteById(employeeAccountId);
    }

}
