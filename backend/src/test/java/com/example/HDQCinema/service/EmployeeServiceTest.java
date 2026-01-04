package com.example.HDQCinema.service;

import com.example.HDQCinema.dto.request.EmployeeCreationRequest;
import com.example.HDQCinema.dto.request.EmployeeUpdateRequest;
import com.example.HDQCinema.dto.response.EmployeeResponse;
import com.example.HDQCinema.entity.Employee;
import com.example.HDQCinema.enums.Position;
import com.example.HDQCinema.exception.AppException;
import com.example.HDQCinema.exception.ErrorCode;
import com.example.HDQCinema.mapper.EmployeeMapper;
import com.example.HDQCinema.repository.EmployeeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("EmployeeService Unit Tests")
class EmployeeServiceTest {

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private EmployeeMapper employeeMapper;

    @InjectMocks
    private EmployeeService employeeService;

    private EmployeeCreationRequest creationRequest;
    private EmployeeUpdateRequest updateRequest;
    private Employee employee;
    private EmployeeResponse employeeResponse;
    private String employeeId;

    @BeforeEach
    void setUp() {
        employeeId = "employee-id-123";

        creationRequest = EmployeeCreationRequest.builder()
                .firstName("John")
                .lastName("Doe")
                .phone("0123456789")
                .email("john@example.com")
                .build();

        employee = Employee.builder()
                .id(employeeId)
                .firstName("John")
                .lastName("Doe")
                .phone("0123456789")
                .email("john@example.com")
                .position(Position.EMPLOYEE)
                .build();

        employeeResponse = EmployeeResponse.builder()
                .firstName("John")
                .lastName("Doe")
                .phone("0123456789")
                .email("john@example.com")
                .position(Position.EMPLOYEE)
                .build();

        updateRequest = new EmployeeUpdateRequest();
        updateRequest.setFirstName("Jane");
        updateRequest.setLastName("Smith");
    }

    @Test
    @DisplayName("Test create employee - thành công")
    void testCreateEmployee_Success() {
        // Given
        when(employeeMapper.toEmployee(any(EmployeeCreationRequest.class))).thenReturn(employee);
        when(employeeRepository.save(any(Employee.class))).thenReturn(employee);
        when(employeeMapper.toEmployeeResponse(any(Employee.class))).thenReturn(employeeResponse);

        // When
        EmployeeResponse result = employeeService.createEmployee(creationRequest);

        // Then
        assertNotNull(result);
        assertEquals("John", result.getFirstName());
        verify(employeeMapper, times(1)).toEmployee(creationRequest);
        verify(employeeRepository, times(1)).save(employee);
        verify(employeeMapper, times(1)).toEmployeeResponse(employee);
    }

    @Test
    @DisplayName("Test get all employees - thành công")
    void testGetEmployee_Success() {
        // Given
        List<Employee> employees = Arrays.asList(employee);
        when(employeeRepository.findAll()).thenReturn(employees);
        when(employeeMapper.toEmployeeResponse(any(Employee.class))).thenReturn(employeeResponse);

        // When
        List<EmployeeResponse> result = employeeService.getEmployee();

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(employeeRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("Test update employee - thành công")
    void testUpdateEmployee_Success() {
        // Given
        Employee updatedEmployee = Employee.builder()
                .id(employeeId)
                .firstName("Jane")
                .lastName("Smith")
                .phone("0123456789")
                .email("john@example.com")
                .build();

        EmployeeResponse updatedResponse = EmployeeResponse.builder()
                .firstName("Jane")
                .lastName("Smith")
                .build();

        when(employeeRepository.findById(employeeId)).thenReturn(Optional.of(employee));
        when(employeeMapper.updateEmployee(any(Employee.class), any(EmployeeUpdateRequest.class)))
                .thenReturn(updatedEmployee);
        when(employeeMapper.toEmployeeResponse(any(Employee.class))).thenReturn(updatedResponse);

        // When
        EmployeeResponse result = employeeService.updateEmployee(employeeId, updateRequest);

        // Then
        assertNotNull(result);
        assertEquals("Jane", result.getFirstName());
        verify(employeeRepository, times(1)).findById(employeeId);
    }

    @Test
    @DisplayName("Test update employee - employee không tồn tại")
    void testUpdateEmployee_EmployeeNotFound() {
        // Given
        when(employeeRepository.findById(employeeId)).thenReturn(Optional.empty());

        // When & Then
        AppException exception = assertThrows(AppException.class, () -> {
            employeeService.updateEmployee(employeeId, updateRequest);
        });

        assertEquals(ErrorCode.EMPLOYEE_NOT_FOUND, exception.getErrorCode());
        verify(employeeRepository, times(1)).findById(employeeId);
    }

    @Test
    @DisplayName("Test delete employee - thành công")
    void testDeleteEmployee_Success() {
        // Given
        when(employeeRepository.existsById(employeeId)).thenReturn(true);
        doNothing().when(employeeRepository).deleteById(employeeId);

        // When
        employeeService.deleteEmployee(employeeId);

        // Then
        verify(employeeRepository, times(1)).existsById(employeeId);
        verify(employeeRepository, times(1)).deleteById(employeeId);
    }

    @Test
    @DisplayName("Test delete employee - employee không tồn tại")
    void testDeleteEmployee_EmployeeNotFound() {
        // Given
        when(employeeRepository.existsById(employeeId)).thenReturn(false);

        // When & Then
        AppException exception = assertThrows(AppException.class, () -> {
            employeeService.deleteEmployee(employeeId);
        });

        assertEquals(ErrorCode.EMPLOYEE_NOT_FOUND, exception.getErrorCode());
        verify(employeeRepository, never()).deleteById(anyString());
    }
}

