package com.example.HDQCinema.service;

import com.example.HDQCinema.dto.request.MemberCreationRequest;
import com.example.HDQCinema.dto.request.MemberUpdateRequest;
import com.example.HDQCinema.dto.response.MemberResponse;
import com.example.HDQCinema.entity.Member;
import com.example.HDQCinema.entity.Role;
import com.example.HDQCinema.exception.AppException;
import com.example.HDQCinema.exception.ErrorCode;
import com.example.HDQCinema.mapper.MemberMapper;
import com.example.HDQCinema.repository.MemberRepository;
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

import java.time.LocalDate;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("MemberService Unit Tests")
class MemberServiceTest {

    @Mock
    private MemberRepository memberRepository;

    @Mock
    private MemberMapper memberMapper;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private RoleRepository roleRepository;

    @InjectMocks
    private MemberService memberService;

    private MemberCreationRequest creationRequest;
    private MemberUpdateRequest updateRequest;
    private Member member;
    private MemberResponse memberResponse;
    private Role memberRole;
    private String memberId;

    @BeforeEach
    void setUp() {
        memberId = "member-id-123";

        memberRole = Role.builder()
                .id(1L)
                .name("MEMBER")
                .description("Member role")
                .build();

        creationRequest = MemberCreationRequest.builder()
                .username("testuser")
                .password("password123")
                .email("test@example.com")
                .phoneNumber("0123456789")
                .firstName("John")
                .lastName("Doe")
                .dob(LocalDate.now().minusYears(20))
                .build();

        member = Member.builder()
                .id(memberId)
                .username("testuser")
                .email("test@example.com")
                .phoneNumber("0123456789")
                .firstName("John")
                .lastName("Doe")
                .dob(LocalDate.now().minusYears(20))
                .roles(Collections.singleton(memberRole))
                .build();

        memberResponse = MemberResponse.builder()
                .username("testuser")
                .email("test@example.com")
                .phoneNumber("0123456789")
                .firstName("John")
                .lastName("Doe")
                .dob(LocalDate.now().minusYears(20))
                .build();

        updateRequest = new MemberUpdateRequest();
        updateRequest.setUsername("testuser");
        updateRequest.setPassword("newpassword123");
        updateRequest.setEmail("newemail@example.com");
    }

    @Test
    @DisplayName("Test create member - thành công")
    void testCreateMember_Success() {
        // Given
        when(memberRepository.findByUsername("testuser")).thenReturn(Optional.empty());
        when(memberMapper.toMember(any(MemberCreationRequest.class))).thenReturn(member);
        when(passwordEncoder.encode("password123")).thenReturn("encoded-password");
        when(roleRepository.findByName("MEMBER")).thenReturn(Optional.of(memberRole));
        when(memberRepository.save(any(Member.class))).thenReturn(member);
        when(memberMapper.toMemberResponse(any(Member.class))).thenReturn(memberResponse);

        // When
        MemberResponse result = memberService.createMember(creationRequest);

        // Then
        assertNotNull(result);
        assertEquals("testuser", result.getUsername());
        verify(memberRepository, times(1)).findByUsername("testuser");
        verify(roleRepository, times(1)).findByName("MEMBER");
        verify(memberRepository, times(1)).save(any(Member.class));
    }

    @Test
    @DisplayName("Test create member - username đã tồn tại")
    void testCreateMember_UsernameExisted() {
        // Given
        when(memberRepository.findByUsername("testuser")).thenReturn(Optional.of(member));

        // When & Then
        AppException exception = assertThrows(AppException.class, () -> {
            memberService.createMember(creationRequest);
        });

        assertEquals(ErrorCode.MEMBER_EXISTED, exception.getErrorCode());
        verify(memberRepository, never()).save(any());
    }

    @Test
    @DisplayName("Test create member - role không tồn tại")
    void testCreateMember_RoleNotFound() {
        // Given
        when(memberRepository.findByUsername("testuser")).thenReturn(Optional.empty());
        when(memberMapper.toMember(any(MemberCreationRequest.class))).thenReturn(member);
        when(passwordEncoder.encode(anyString())).thenReturn("encoded-password");
        when(roleRepository.findByName("MEMBER")).thenReturn(Optional.empty());

        // When & Then
        AppException exception = assertThrows(AppException.class, () -> {
            memberService.createMember(creationRequest);
        });

        assertEquals(ErrorCode.ROLE_NOT_FOUND, exception.getErrorCode());
    }

    @Test
    @DisplayName("Test create member - DataIntegrityViolationException")
    void testCreateMember_DataIntegrityViolation() {
        // Given
        when(memberRepository.findByUsername("testuser")).thenReturn(Optional.empty());
        when(memberMapper.toMember(any(MemberCreationRequest.class))).thenReturn(member);
        when(passwordEncoder.encode(anyString())).thenReturn("encoded-password");
        when(roleRepository.findByName("MEMBER")).thenReturn(Optional.of(memberRole));
        when(memberRepository.save(any(Member.class)))
                .thenThrow(new DataIntegrityViolationException("Email already exists"));

        // When & Then
        AppException exception = assertThrows(AppException.class, () -> {
            memberService.createMember(creationRequest);
        });

        assertEquals(ErrorCode.MEMBER_EXISTED, exception.getErrorCode());
    }

    @Test
    @DisplayName("Test get all members - thành công")
    void testGetMember_Success() {
        // Given
        List<Member> members = Arrays.asList(member);
        when(memberRepository.findAll()).thenReturn(members);
        when(memberMapper.toMemberResponse(any(Member.class))).thenReturn(memberResponse);

        // When
        List<MemberResponse> result = memberService.getMember();

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(memberRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("Test update member - thành công")
    void testUpdateMember_Success() {
        // Given
        when(memberRepository.findById(memberId)).thenReturn(Optional.of(member));
        when(passwordEncoder.encode("newpassword123")).thenReturn("encoded-new-password");
        when(memberRepository.save(any(Member.class))).thenReturn(member);

        MemberResponse updatedResponse = MemberResponse.builder()
                .firstName("Jane")
                .lastName("Smith")
                .build();
        when(memberMapper.toMemberResponse(any(Member.class))).thenReturn(updatedResponse);

        // When
        MemberResponse result = memberService.updateMember(memberId, updateRequest);

        // Then
        assertNotNull(result);
        verify(memberRepository, times(1)).findById(memberId);
        verify(memberRepository, times(1)).save(any(Member.class));
    }

    @Test
    @DisplayName("Test update member - member không tồn tại")
    void testUpdateMember_MemberNotFound() {
        // Given
        when(memberRepository.findById(memberId)).thenReturn(Optional.empty());

        // When & Then
        AppException exception = assertThrows(AppException.class, () -> {
            memberService.updateMember(memberId, updateRequest);
        });

        assertEquals(ErrorCode.MEMBER_NOT_FOUND, exception.getErrorCode());
    }

    @Test
    @DisplayName("Test update member - không đổi password")
    void testUpdateMember_NoPasswordChange() {
        // Given
        MemberUpdateRequest requestWithoutPassword = new MemberUpdateRequest();
        requestWithoutPassword.setUsername("testuser");

        when(memberRepository.findById(memberId)).thenReturn(Optional.of(member));
        when(memberRepository.save(any(Member.class))).thenReturn(member);
        when(memberMapper.toMemberResponse(any(Member.class))).thenReturn(memberResponse);

        // When
        MemberResponse result = memberService.updateMember(memberId, requestWithoutPassword);

        // Then
        assertNotNull(result);
        verify(passwordEncoder, never()).encode(anyString());
    }

    @Test
    @DisplayName("Test delete member - thành công")
    void testDeleteMember_Success() {
        // Given
        when(memberRepository.existsById(memberId)).thenReturn(true);
        doNothing().when(memberRepository).deleteById(memberId);

        // When
        memberService.deleteMember(memberId);

        // Then
        verify(memberRepository, times(1)).existsById(memberId);
        verify(memberRepository, times(1)).deleteById(memberId);
    }

    @Test
    @DisplayName("Test delete member - member không tồn tại")
    void testDeleteMember_MemberNotFound() {
        // Given
        when(memberRepository.existsById(memberId)).thenReturn(false);

        // When & Then
        AppException exception = assertThrows(AppException.class, () -> {
            memberService.deleteMember(memberId);
        });

        assertEquals(ErrorCode.MEMBER_NOT_FOUND, exception.getErrorCode());
        verify(memberRepository, never()).deleteById(anyString());
    }
}

