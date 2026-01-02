// File: com/example/HDQCinema/service/MemberService.java
package com.example.HDQCinema.service;

import com.example.HDQCinema.constant.PredefinedRole; // Giả sử bạn có class hằng số này
import com.example.HDQCinema.dto.request.MemberCreationRequest;
import com.example.HDQCinema.dto.request.MemberUpdateRequest;
import com.example.HDQCinema.dto.response.MemberResponse;
import com.example.HDQCinema.entity.Member;
import com.example.HDQCinema.entity.Role;
import com.example.HDQCinema.exception.AppException;
import com.example.HDQCinema.exception.ErrorCode;
import com.example.HDQCinema.mapper.MemberMapper;
import com.example.HDQCinema.repository.MemberRepository;
import com.example.HDQCinema.repository.RoleRepository; // Cần thêm repo này
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder; // Cần thêm cái này
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class MemberService {
    MemberRepository memberRepository;
    MemberMapper memberMapper;
    PasswordEncoder passwordEncoder;
    RoleRepository roleRepository;

    public MemberResponse createMember(MemberCreationRequest request){
        if (memberRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new AppException(ErrorCode.MEMBER_EXISTED);
        }

        Member member = memberMapper.toMember(request);

        member.setPassword(passwordEncoder.encode(request.getPassword()));

        Set<Role> roles = new HashSet<>();
        Role userRole = roleRepository.findByName("MEMBER")
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));
        roles.add(userRole);
        member.setRoles(roles);

        try {
            memberRepository.save(member);
        } catch (DataIntegrityViolationException exception) {
            throw new AppException(ErrorCode.MEMBER_EXISTED);
        }

        return memberMapper.toMemberResponse(member);
    }

    // Các hàm getEmployee, deleteEmployee giữ nguyên...
    @PreAuthorize("hasRole('ADMIN')")
    public List<MemberResponse> getMember(){
        return memberRepository.findAll().stream()
                .map(memberMapper::toMemberResponse)
                .toList();
    }

    @PreAuthorize("hasRole('ADMIN')")
    public void deleteMember(String employeeId){
        if (!memberRepository.existsById(employeeId)){
            throw new AppException(ErrorCode.MEMBER_NOT_FOUND);
        }
        memberRepository.deleteById(employeeId);
    }

    // Hàm update cập nhật thêm logic đổi mật khẩu
    public MemberResponse updateMember(String memberId, MemberUpdateRequest request){
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new AppException(ErrorCode.MEMBER_NOT_FOUND));

        // Map các thông tin cơ bản
        memberMapper.updateMember(member, request);

        // Nếu request có gửi password mới -> Mã hóa lại
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            member.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        return memberMapper.toMemberResponse(memberRepository.save(member));
    }

    public MemberResponse getMyInfo(){
        var context = SecurityContextHolder.getContext();
        String name = context.getAuthentication().getName();

        Member member = memberRepository.findByUsername(name)
                .orElseThrow(() -> new AppException(ErrorCode.MEMBER_NOT_FOUND));

        return memberMapper.toMemberResponse(member);
    }
}