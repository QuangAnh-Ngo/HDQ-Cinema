package com.example.HDQCinema.controller;

import com.example.HDQCinema.dto.request.MemberCreationRequest;
import com.example.HDQCinema.dto.request.MemberUpdateRequest;
import com.example.HDQCinema.dto.response.MemberResponse;
import com.example.HDQCinema.service.MemberService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(MemberController.class)
@DisplayName("MemberController Integration Tests")
class MemberControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private MemberService memberService;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper.registerModule(new JavaTimeModule());
    }

    @Test
    @DisplayName("POST /members - tạo member thành công")
    void testCreateMember_Success() throws Exception {
        // Given
        MemberCreationRequest request = MemberCreationRequest.builder()
                .username("testuser")
                .password("password123")
                .email("test@example.com")
                .phoneNumber("0123456789")
                .firstName("John")
                .lastName("Doe")
                .dob(LocalDate.now().minusYears(20))
                .build();

        MemberResponse response = MemberResponse.builder()
                .username("testuser")
                .email("test@example.com")
                .build();

        when(memberService.createMember(any(MemberCreationRequest.class))).thenReturn(response);

        // When & Then
        mockMvc.perform(post("/members")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.username").value("testuser"));
    }

    @Test
    @DisplayName("GET /members - lấy tất cả members")
    void testGetMember() throws Exception {
        // Given
        MemberResponse response1 = MemberResponse.builder()
                .username("user1")
                .build();
        MemberResponse response2 = MemberResponse.builder()
                .username("user2")
                .build();

        List<MemberResponse> responses = Arrays.asList(response1, response2);
        when(memberService.getMember()).thenReturn(responses);

        // When & Then
        mockMvc.perform(get("/members"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.length()").value(2));
    }

    @Test
    @DisplayName("PUT /members/{id} - update member")
    void testUpdateMember() throws Exception {
        // Given
        String memberId = "member-id-123";
        MemberUpdateRequest request = new MemberUpdateRequest();
        request.setUsername("testuser");
        request.setPassword("newpassword123");

        MemberResponse response = MemberResponse.builder()
                .firstName("Jane")
                .build();

        when(memberService.updateMember(anyString(), any(MemberUpdateRequest.class))).thenReturn(response);

        // When & Then
        mockMvc.perform(put("/members/{employeeAccountId}", memberId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.firstName").value("Jane"));
    }

    @Test
    @DisplayName("DELETE /members/{id} - delete member")
    void testDeleteMember() throws Exception {
        // Given
        String memberId = "member-id-123";
        doNothing().when(memberService).deleteMember(memberId);

        // When & Then
        mockMvc.perform(delete("/members/{employeeId}", memberId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result").value("Delete user successfully"));
    }
}

