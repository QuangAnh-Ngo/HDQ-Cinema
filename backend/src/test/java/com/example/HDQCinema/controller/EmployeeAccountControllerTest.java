package com.example.HDQCinema.controller;

import com.example.HDQCinema.dto.request.EmployeeAccountCreationRequest;
import com.example.HDQCinema.dto.request.EmployeeAccountUpdateRequest;
import com.example.HDQCinema.dto.response.EmployeeAccountResponse;
import com.example.HDQCinema.service.EmployeeAccountService;
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

@WebMvcTest(EmployeeAccountController.class)
@DisplayName("EmployeeAccountController Integration Tests")
class EmployeeAccountControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private EmployeeAccountService employeeAccountService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("POST /accounts - tạo employee account thành công")
    void testCreateEmployeeAccount_Success() throws Exception {
        // Given
        EmployeeAccountCreationRequest request = EmployeeAccountCreationRequest.builder()
                .username("testuser")
                .password("password123")
                .email("test@example.com")
                .employee("employee-id-123")
                .roles(Arrays.asList("EMPLOYEE"))
                .build();

        EmployeeAccountResponse response = EmployeeAccountResponse.builder()
                .employeeAccountId("account-id-123")
                .username("testuser")
                .email("test@example.com")
                .build();

        when(employeeAccountService.createEmployeeAccount(any(EmployeeAccountCreationRequest.class)))
                .thenReturn(response);

        // When & Then
        mockMvc.perform(post("/accounts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.employeeAccountId").value("account-id-123"))
                .andExpect(jsonPath("$.result.username").value("testuser"));
    }

    @Test
    @DisplayName("GET /accounts - lấy tất cả employee accounts")
    void testGetEmployeeAccount() throws Exception {
        // Given
        EmployeeAccountResponse response1 = EmployeeAccountResponse.builder()
                .employeeAccountId("account-1")
                .username("user1")
                .build();
        EmployeeAccountResponse response2 = EmployeeAccountResponse.builder()
                .employeeAccountId("account-2")
                .username("user2")
                .build();

        List<EmployeeAccountResponse> responses = Arrays.asList(response1, response2);
        when(employeeAccountService.getEmployeeAccount()).thenReturn(responses);

        // When & Then
        mockMvc.perform(get("/accounts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.length()").value(2));
    }

    @Test
    @DisplayName("PUT /accounts/{id} - update employee account")
    void testUpdateEmployeeAccount() throws Exception {
        // Given
        String accountId = "account-id-123";
        EmployeeAccountUpdateRequest request = EmployeeAccountUpdateRequest.builder()
                .password("newpassword123")
                .roles(Arrays.asList("MANAGER"))
                .build();

        EmployeeAccountResponse response = EmployeeAccountResponse.builder()
                .employeeAccountId(accountId)
                .build();

        when(employeeAccountService.updateEmployeeAccount(anyString(), any(EmployeeAccountUpdateRequest.class)))
                .thenReturn(response);

        // When & Then
        mockMvc.perform(put("/accounts/{employeeAccountId}", accountId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.employeeAccountId").value(accountId));
    }

    @Test
    @DisplayName("DELETE /accounts/{id} - delete employee account")
    void testDeleteEmployeeAccount() throws Exception {
        // Given
        String accountId = "account-id-123";
        doNothing().when(employeeAccountService).deleteEmployeeAccount(accountId);

        // When & Then
        mockMvc.perform(delete("/accounts/{employeeAccountId}", accountId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result").value("Delete user successfully"));
    }
}

