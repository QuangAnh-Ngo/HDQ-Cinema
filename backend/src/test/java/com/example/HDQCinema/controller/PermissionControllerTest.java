package com.example.HDQCinema.controller;

import com.example.HDQCinema.dto.request.PermissionCreationRequest;
import com.example.HDQCinema.dto.request.PermissionUpdateRequest;
import com.example.HDQCinema.dto.response.PermissionResponse;
import com.example.HDQCinema.service.PermissionService;
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

@WebMvcTest(PermissionController.class)
@DisplayName("PermissionController Integration Tests")
class PermissionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PermissionService permissionService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("POST /permissions - tạo permission thành công")
    void testCreatePermission_Success() throws Exception {
        // Given
        PermissionCreationRequest request = PermissionCreationRequest.builder()
                .name("READ")
                .description("Read permission")
                .build();

        PermissionResponse response = PermissionResponse.builder()
                .name("READ")
                .description("Read permission")
                .build();

        when(permissionService.createPermission(any(PermissionCreationRequest.class))).thenReturn(response);

        // When & Then
        mockMvc.perform(post("/permissions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.name").value("READ"));
    }

    @Test
    @DisplayName("GET /permissions - lấy tất cả permissions")
    void testGetPermission() throws Exception {
        // Given
        PermissionResponse response1 = PermissionResponse.builder()
                .name("READ")
                .build();
        PermissionResponse response2 = PermissionResponse.builder()
                .name("WRITE")
                .build();

        List<PermissionResponse> responses = Arrays.asList(response1, response2);
        when(permissionService.getPermission()).thenReturn(responses);

        // When & Then
        mockMvc.perform(get("/permissions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.length()").value(2));
    }

    @Test
    @DisplayName("PUT /permissions/{id} - update permission")
    void testUpdatePermission() throws Exception {
        // Given
        String permissionId = "1";
        PermissionUpdateRequest request = PermissionUpdateRequest.builder()
                .name("WRITE")
                .description("Write permission")
                .build();

        PermissionResponse response = PermissionResponse.builder()
                .name("WRITE")
                .build();

        when(permissionService.updatePermission(anyString(), any(PermissionUpdateRequest.class))).thenReturn(response);

        // When & Then
        mockMvc.perform(put("/permissions/{employeeAccountId}", permissionId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.name").value("WRITE"));
    }

    @Test
    @DisplayName("DELETE /permissions/{id} - delete permission")
    void testDeletePermission() throws Exception {
        // Given
        String permissionId = "1";
        doNothing().when(permissionService).deletePermission(permissionId);

        // When & Then
        mockMvc.perform(delete("/permissions/{employeeId}", permissionId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result").value("Delete user successfully"));
    }
}

