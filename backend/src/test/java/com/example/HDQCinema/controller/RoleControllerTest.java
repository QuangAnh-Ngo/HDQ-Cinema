package com.example.HDQCinema.controller;

import com.example.HDQCinema.dto.request.RoleCreationRequest;
import com.example.HDQCinema.dto.request.RoleUpdateRequest;
import com.example.HDQCinema.dto.response.RoleResponse;
import com.example.HDQCinema.service.RoleService;
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

@WebMvcTest(RoleController.class)
@DisplayName("RoleController Integration Tests")
class RoleControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private RoleService roleService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("POST /roles - tạo role thành công")
    void testCreateRole_Success() throws Exception {
        // Given
        RoleCreationRequest request = RoleCreationRequest.builder()
                .name("MANAGER")
                .description("Manager role")
                .permissions(Arrays.asList("READ", "WRITE"))
                .build();

        RoleResponse response = RoleResponse.builder()
                .name("MANAGER")
                .description("Manager role")
                .build();

        when(roleService.createRole(any(RoleCreationRequest.class))).thenReturn(response);

        // When & Then
        mockMvc.perform(post("/roles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.name").value("MANAGER"));
    }

    @Test
    @DisplayName("GET /roles - lấy tất cả roles")
    void testGetRole() throws Exception {
        // Given
        RoleResponse response1 = RoleResponse.builder()
                .name("MANAGER")
                .build();
        RoleResponse response2 = RoleResponse.builder()
                .name("EMPLOYEE")
                .build();

        List<RoleResponse> responses = Arrays.asList(response1, response2);
        when(roleService.getAll()).thenReturn(responses);

        // When & Then
        mockMvc.perform(get("/roles"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.length()").value(2));
    }

    @Test
    @DisplayName("PUT /roles/{id} - update role")
    void testUpdateRole() throws Exception {
        // Given
        String roleId = "1";
        RoleUpdateRequest request = RoleUpdateRequest.builder()
                .name("ADMIN")
                .description("Admin role")
                .permissions(Arrays.asList("1", "2"))
                .build();

        RoleResponse response = RoleResponse.builder()
                .name("ADMIN")
                .build();

        when(roleService.updateRole(anyString(), any(RoleUpdateRequest.class))).thenReturn(response);

        // When & Then
        mockMvc.perform(put("/roles/{employeeAccountId}", roleId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.name").value("ADMIN"));
    }

    @Test
    @DisplayName("DELETE /roles/{id} - delete role")
    void testDeleteRole() throws Exception {
        // Given
        String roleId = "1";
        doNothing().when(roleService).deleteRole(roleId);

        // When & Then
        mockMvc.perform(delete("/roles/{employeeId}", roleId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result").value("Delete user successfully"));
    }
}

