package com.example.HDQCinema.service;

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
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

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

    // ✅ FIX: Cho phép MANAGER và ADMIN
    @PreAuthorize("hasAuthority('MANAGE_EMPLOYEES')")
    public EmployeeAccountResponse createEmployeeAccount(EmployeeAccountCreationRequest request) {
        // Kiểm tra MANAGER không được tạo ADMIN/MANAGER
        checkManagerPermission(request.getRoles());

        EmployeeAccount employeeAccount = employeeAccountMapper.toEmployeeAccount(request);
        employeeAccount.setPassword(passwordEncoder.encode(employeeAccount.getPassword()));

        Set<Role> roles = new HashSet<>();
        List<String> requestedRoles = request.getRoles();

        if (requestedRoles != null && !requestedRoles.isEmpty()) {
            for (String roleName : requestedRoles) {
                Role role = roleRepository.findByName(roleName)
                        .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));
                roles.add(role);
            }
        } else {
            Role defaultRole = roleRepository.findByName("EMPLOYEE")
                    .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));
            roles.add(defaultRole);
        }

        employeeAccount.setRoles(roles);

        Long employeeId = request.getEmployeeId();
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new AppException(ErrorCode.EMPLOYEE_NOT_FOUND));
        employeeAccount.setEmployee(employee);

        try {
            employeeAccountRepository.save(employeeAccount);
        } catch (DataIntegrityViolationException exception) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }

        return employeeAccountMapper.toEmployeeAccountResponse(employeeAccount);
    }

    // ✅ FIX: Cho phép MANAGER và ADMIN xem danh sách
    @PreAuthorize("hasAuthority('MANAGE_EMPLOYEES')")
    public List<EmployeeAccountResponse> getEmployeeAccount() {
        List<EmployeeAccount> users = employeeAccountRepository.findAll();
        return users.stream().map(employeeAccountMapper::toEmployeeAccountResponse).toList();
    }

    // ✅ FIX: Cho phép MANAGER và ADMIN
    @PreAuthorize("hasAuthority('MANAGE_EMPLOYEES')")
    public EmployeeAccountResponse updateEmployeeAccount(String employeeAccountId, EmployeeAccountUpdateRequest request) {
        EmployeeAccount employeeAccount = employeeAccountRepository.findById(employeeAccountId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // Kiểm tra MANAGER không được sửa ADMIN/MANAGER
        checkManagerCanManageAccount(employeeAccount);
        if (request.getRoles() != null) {
            checkManagerPermission(request.getRoles());
        }

        employeeAccountMapper.updateEmployeeAccount(employeeAccount, request);

        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            employeeAccount.setPassword(passwordEncoder.encode(request.getPassword()));
        }

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

        if (request.getEmployeeId() != null) {
            employeeAccount.setEmployee(employeeRepository
                    .findById(request.getEmployeeId())
                    .orElseThrow(() -> new AppException(ErrorCode.EMPLOYEE_NOT_FOUND)));
        }

        return employeeAccountMapper.toEmployeeAccountResponse(employeeAccountRepository.save(employeeAccount));
    }

    // ✅ FIX: Cho phép MANAGER và ADMIN
    @PreAuthorize("hasAuthority('MANAGE_EMPLOYEES')")
    public void deleteEmployeeAccount(String employeeAccountId) {
        EmployeeAccount account = employeeAccountRepository.findById(employeeAccountId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // Kiểm tra MANAGER không được xóa ADMIN/MANAGER
        checkManagerCanManageAccount(account);

        employeeAccountRepository.deleteById(employeeAccountId);
    }

    public EmployeeAccountResponse getMyInfo() {
        var context = SecurityContextHolder.getContext();
        String name = context.getAuthentication().getName();

        EmployeeAccount employeeAccount = employeeAccountRepository.findByUsername(name)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        return employeeAccountMapper.toEmployeeAccountResponse(employeeAccount);
    }

    // ========== HELPER METHODS ==========

    /**
     * Kiểm tra user hiện tại có phải ADMIN không
     */
    private boolean isCurrentUserAdmin() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));
    }

    /**
     * MANAGER không được tạo account với role ADMIN hoặc MANAGER
     */
    private void checkManagerPermission(List<String> roles) {
        if (!isCurrentUserAdmin() && roles != null) {
            for (String role : roles) {
                if (role.equals("ADMIN") || role.equals("MANAGER")) {
                    throw new AppException(ErrorCode.UNAUTHORIZED);
                }
            }
        }
    }

    /**
     * MANAGER không được sửa/xóa account có role ADMIN hoặc MANAGER
     */
    private void checkManagerCanManageAccount(EmployeeAccount account) {
        if (!isCurrentUserAdmin()) {
            boolean hasHigherRole = account.getRoles().stream()
                    .anyMatch(role -> role.getName().equals("ADMIN") || role.getName().equals("MANAGER"));
            if (hasHigherRole) {
                throw new AppException(ErrorCode.UNAUTHORIZED);
            }
        }
    }
}