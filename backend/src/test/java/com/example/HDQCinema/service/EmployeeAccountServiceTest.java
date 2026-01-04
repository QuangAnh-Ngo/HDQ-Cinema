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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("EmployeeAccountService Unit Tests")
class EmployeeAccountServiceTest {

    @Mock
    private EmployeeAccountRepository employeeAccountRepository;

    @Mock
    private EmployeeAccountMapper employeeAccountMapper;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private EmployeeRepository employeeRepository;

    @InjectMocks
    private EmployeeAccountService employeeAccountService;

    private EmployeeAccountCreationRequest creationRequest;
    private EmployeeAccountUpdateRequest updateRequest;
    private EmployeeAccount employeeAccount;
    private Employee employee;
    private Role role;
    private String employeeAccountId;
    private String employeeId;

    @BeforeEach
    void setUp() {
        employeeAccountId = "account-id-123";
        employeeId = "employee-id-123";

        employee = Employee.builder()
                .id(employeeId)
                .firstName("John")
                .lastName("Doe")
                .email("john@example.com")
                .phone("0123456789")
                .build();

        role = Role.builder()
                .id(1L)
                .name("EMPLOYEE")
                .description("Employee role")
                .build();

        employeeAccount = EmployeeAccount.builder()
                .id(employeeAccountId)
                .username("testuser")
                .email("test@example.com")
                .employee(employee)
                .roles(Collections.singleton(role))
                .build();

        creationRequest = EmployeeAccountCreationRequest.builder()
                .username("testuser")
                .password("password123")
                .email("test@example.com")
                .employee(employeeId)
                .roles(Arrays.asList("EMPLOYEE"))
                .build();

        updateRequest = EmployeeAccountUpdateRequest.builder()
                .password("newpassword123")
                .roles(Arrays.asList("MANAGER"))
                .employee(employeeId)
                .build();
    }

    @Test
    @DisplayName("Test create employee account - thành công với roles")
    void testCreateEmployeeAccount_SuccessWithRoles() {
        // Given
        when(employeeAccountMapper.toEmployeeAccount(any(EmployeeAccountCreationRequest.class)))
                .thenReturn(employeeAccount);
        when(passwordEncoder.encode(anyString())).thenReturn("encoded-password");
        when(roleRepository.findByName("EMPLOYEE")).thenReturn(Optional.of(role));
        when(employeeRepository.findById(employeeId)).thenReturn(Optional.of(employee));
        when(employeeAccountRepository.save(any(EmployeeAccount.class))).thenReturn(employeeAccount);

        EmployeeAccountResponse response = EmployeeAccountResponse.builder()
                .employeeAccountId(employeeAccountId)
                .username("testuser")
                .email("test@example.com")
                .build();
        when(employeeAccountMapper.toEmployeeAccountResponse(any(EmployeeAccount.class))).thenReturn(response);

        // When
        EmployeeAccountResponse result = employeeAccountService.createEmployeeAccount(creationRequest);

        // Then
        assertNotNull(result);
        assertEquals(employeeAccountId, result.getEmployeeAccountId());
        verify(employeeAccountRepository, times(1)).save(any(EmployeeAccount.class));
        verify(roleRepository, times(1)).findByName("EMPLOYEE");
    }

    @Test
    @DisplayName("Test create employee account - thành công với default role")
    void testCreateEmployeeAccount_SuccessWithDefaultRole() {
        // Given
        EmployeeAccountCreationRequest requestWithoutRoles = EmployeeAccountCreationRequest.builder()
                .username("testuser")
                .password("password123")
                .email("test@example.com")
                .employee(employeeId)
                .roles(null)
                .build();

        when(employeeAccountMapper.toEmployeeAccount(any(EmployeeAccountCreationRequest.class)))
                .thenReturn(employeeAccount);
        when(passwordEncoder.encode(anyString())).thenReturn("encoded-password");
        when(roleRepository.findByName("EMPLOYEE")).thenReturn(Optional.of(role));
        when(employeeRepository.findById(employeeId)).thenReturn(Optional.of(employee));
        when(employeeAccountRepository.save(any(EmployeeAccount.class))).thenReturn(employeeAccount);

        EmployeeAccountResponse response = EmployeeAccountResponse.builder()
                .employeeAccountId(employeeAccountId)
                .build();
        when(employeeAccountMapper.toEmployeeAccountResponse(any(EmployeeAccount.class))).thenReturn(response);

        // When
        EmployeeAccountResponse result = employeeAccountService.createEmployeeAccount(requestWithoutRoles);

        // Then
        assertNotNull(result);
        verify(roleRepository, times(1)).findByName("EMPLOYEE");
    }

    @Test
    @DisplayName("Test create employee account - role không tồn tại")
    void testCreateEmployeeAccount_RoleNotFound() {
        // Given
        when(employeeAccountMapper.toEmployeeAccount(any(EmployeeAccountCreationRequest.class)))
                .thenReturn(employeeAccount);
        when(passwordEncoder.encode(anyString())).thenReturn("encoded-password");
        when(roleRepository.findByName("EMPLOYEE")).thenReturn(Optional.empty());

        // When & Then
        AppException exception = assertThrows(AppException.class, () -> {
            employeeAccountService.createEmployeeAccount(creationRequest);
        });

        assertEquals(ErrorCode.ROLE_NOT_FOUND, exception.getErrorCode());
    }

    @Test
    @DisplayName("Test create employee account - employee không tồn tại")
    void testCreateEmployeeAccount_EmployeeNotFound() {
        // Given
        when(employeeAccountMapper.toEmployeeAccount(any(EmployeeAccountCreationRequest.class)))
                .thenReturn(employeeAccount);
        when(passwordEncoder.encode(anyString())).thenReturn("encoded-password");
        when(roleRepository.findByName("EMPLOYEE")).thenReturn(Optional.of(role));
        when(employeeRepository.findById(employeeId)).thenReturn(Optional.empty());

        // When & Then
        AppException exception = assertThrows(AppException.class, () -> {
            employeeAccountService.createEmployeeAccount(creationRequest);
        });

        assertEquals(ErrorCode.EMPLOYEE_NOT_FOUND, exception.getErrorCode());
    }

    @Test
    @DisplayName("Test create employee account - username đã tồn tại")
    void testCreateEmployeeAccount_UserExisted() {
        // Given
        when(employeeAccountMapper.toEmployeeAccount(any(EmployeeAccountCreationRequest.class)))
                .thenReturn(employeeAccount);
        when(passwordEncoder.encode(anyString())).thenReturn("encoded-password");
        when(roleRepository.findByName("EMPLOYEE")).thenReturn(Optional.of(role));
        when(employeeRepository.findById(employeeId)).thenReturn(Optional.of(employee));
        when(employeeAccountRepository.save(any(EmployeeAccount.class)))
                .thenThrow(new DataIntegrityViolationException("Username already exists"));

        // When & Then
        AppException exception = assertThrows(AppException.class, () -> {
            employeeAccountService.createEmployeeAccount(creationRequest);
        });

        assertEquals(ErrorCode.USER_EXISTED, exception.getErrorCode());
    }

    @Test
    @DisplayName("Test get all employee accounts - thành công")
    void testGetEmployeeAccount_Success() {
        // Given
        List<EmployeeAccount> accounts = Arrays.asList(employeeAccount);
        when(employeeAccountRepository.findAll()).thenReturn(accounts);

        EmployeeAccountResponse response = EmployeeAccountResponse.builder()
                .employeeAccountId(employeeAccountId)
                .build();
        when(employeeAccountMapper.toEmployeeAccountResponse(any(EmployeeAccount.class))).thenReturn(response);

        // When
        List<EmployeeAccountResponse> result = employeeAccountService.getEmployeeAccount();

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(employeeAccountRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("Test update employee account - thành công")
    void testUpdateEmployeeAccount_Success() {
        // Given
        Role managerRole = Role.builder()
                .id(2L)
                .name("MANAGER")
                .build();

        when(employeeAccountRepository.findById(employeeAccountId)).thenReturn(Optional.of(employeeAccount));
        when(passwordEncoder.encode(anyString())).thenReturn("encoded-new-password");
        when(roleRepository.findByName("MANAGER")).thenReturn(Optional.of(managerRole));
        when(employeeRepository.findById(employeeId)).thenReturn(Optional.of(employee));
        when(employeeAccountRepository.save(any(EmployeeAccount.class))).thenReturn(employeeAccount);

        EmployeeAccountResponse response = EmployeeAccountResponse.builder()
                .employeeAccountId(employeeAccountId)
                .build();
        when(employeeAccountMapper.toEmployeeAccountResponse(any(EmployeeAccount.class))).thenReturn(response);

        // When
        EmployeeAccountResponse result = employeeAccountService.updateEmployeeAccount(employeeAccountId, updateRequest);

        // Then
        assertNotNull(result);
        verify(employeeAccountRepository, times(1)).findById(employeeAccountId);
        verify(employeeAccountRepository, times(1)).save(any(EmployeeAccount.class));
    }

    @Test
    @DisplayName("Test update employee account - account không tồn tại")
    void testUpdateEmployeeAccount_AccountNotFound() {
        // Given
        when(employeeAccountRepository.findById(employeeAccountId)).thenReturn(Optional.empty());

        // When & Then
        AppException exception = assertThrows(AppException.class, () -> {
            employeeAccountService.updateEmployeeAccount(employeeAccountId, updateRequest);
        });

        assertEquals(ErrorCode.USER_NOT_FOUND, exception.getErrorCode());
    }

    @Test
    @DisplayName("Test delete employee account - thành công")
    void testDeleteEmployeeAccount_Success() {
        // Given
        when(employeeAccountRepository.existsById(employeeAccountId)).thenReturn(true);
        doNothing().when(employeeAccountRepository).deleteById(employeeAccountId);

        // When
        employeeAccountService.deleteEmployeeAccount(employeeAccountId);

        // Then
        verify(employeeAccountRepository, times(1)).existsById(employeeAccountId);
        verify(employeeAccountRepository, times(1)).deleteById(employeeAccountId);
    }

    @Test
    @DisplayName("Test delete employee account - account không tồn tại")
    void testDeleteEmployeeAccount_AccountNotFound() {
        // Given
        when(employeeAccountRepository.existsById(employeeAccountId)).thenReturn(false);

        // When & Then
        AppException exception = assertThrows(AppException.class, () -> {
            employeeAccountService.deleteEmployeeAccount(employeeAccountId);
        });

        assertEquals(ErrorCode.USER_NOT_FOUND, exception.getErrorCode());
        verify(employeeAccountRepository, never()).deleteById(anyString());
    }
}

