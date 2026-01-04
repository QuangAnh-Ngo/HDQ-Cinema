package com.example.HDQCinema.controller;

import com.example.HDQCinema.dto.request.EmployeeCreationRequest;
import com.example.HDQCinema.dto.request.EmployeeUpdateRequest;
import com.example.HDQCinema.dto.response.EmployeeResponse;
import com.example.HDQCinema.enums.Position;
import com.example.HDQCinema.service.EmployeeService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(EmployeeController.class)
@DisplayName("EmployeeController Integration Tests")
class EmployeeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private EmployeeService employeeService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("POST /employees - tạo employee thành công")
    void testCreateEmployee_Success() throws Exception {
        // Given
        EmployeeCreationRequest request = EmployeeCreationRequest.builder()
                .firstName("John")
                .lastName("Doe")
                .phone("0123456789")
                .email("john@example.com")
                .build();

        EmployeeResponse response = EmployeeResponse.builder()
                .firstName("John")
                .lastName("Doe")
                .position(Position.EMPLOYEE)
                .build();

        when(employeeService.createEmployee(any(EmployeeCreationRequest.class))).thenReturn(response);

        // When & Then
        mockMvc.perform(post("/employees")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.firstName").value("John"));
    }

    @Test
    @DisplayName("GET /employees - lấy tất cả employees")
    void testGetEmployee() throws Exception {
        // Given
        EmployeeResponse response1 = EmployeeResponse.builder()
                .firstName("John")
                .build();
        EmployeeResponse response2 = EmployeeResponse.builder()
                .firstName("Jane")
                .build();

        List<EmployeeResponse> responses = Arrays.asList(response1, response2);
        when(employeeService.getEmployee()).thenReturn(responses);

        // When & Then
        mockMvc.perform(get("/employees"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.length()").value(2));
    }

    @Test
    @DisplayName("PUT /employees/{id} - update employee")
    void testUpdateEmployee() throws Exception {
        // Given
        String employeeId = "employee-id-123";
        EmployeeUpdateRequest request = EmployeeUpdateRequest.builder()
                .firstName("Jane")
                .lastName("Smith")
                .build();

        EmployeeResponse response = EmployeeResponse.builder()
                .firstName("Jane")
                .build();

        when(employeeService.updateEmployee(anyString(), any(EmployeeUpdateRequest.class))).thenReturn(response);

        // When & Then
        mockMvc.perform(put("/employees/{employeeAccountId}", employeeId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.firstName").value("Jane"));
    }

    @Test
    @DisplayName("DELETE /employees/{id} - delete employee")
    void testDeleteEmployee() throws Exception {
        // Given
        String employeeId = "employee-id-123";
        doNothing().when(employeeService).deleteEmployee(employeeId);

        // When & Then
        mockMvc.perform(delete("/employees/{employeeId}", employeeId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result").value("Delete user successfully"));
    }
}

