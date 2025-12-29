package com.example.HDQCinema.service;

import com.example.HDQCinema.dto.request.EmployeeCreationRequest;
import com.example.HDQCinema.dto.request.EmployeeUpdateRequest;
import com.example.HDQCinema.dto.request.MemberCreationRequest;
import com.example.HDQCinema.dto.request.MemberUpdateRequest;
import com.example.HDQCinema.dto.response.EmployeeResponse;
import com.example.HDQCinema.dto.response.MemberResponse;
import com.example.HDQCinema.entity.Employee;
import com.example.HDQCinema.entity.Member;
import com.example.HDQCinema.exception.AppException;
import com.example.HDQCinema.exception.ErrorCode;
import com.example.HDQCinema.mapper.MemberMapper;
import com.example.HDQCinema.repository.MemberRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class MemberService {
    MemberRepository memberRepository;
    MemberMapper memberMapper;

    @PreAuthorize("hasRole('ADMIN')")
    public MemberResponse createMember(MemberCreationRequest request){
        Member member = memberMapper.toMember(request);

        memberRepository.save(member);
        return memberMapper.toMemberResponse(member);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public List<MemberResponse> getEmployee(){
        List<Member> users = memberRepository.findAll();

        return users.stream().map(memberMapper::toMemberResponse)
                .toList();
    }

    @PreAuthorize("hasRole('ADMIN')")
    public MemberResponse updateMember(String memberId, MemberUpdateRequest request){
        Member user = memberRepository.findById(memberId)
                .orElseThrow(()-> new AppException(ErrorCode.USER_NOT_FOUND));

        return memberMapper.toMemberResponse(memberMapper.updateMember(user, request));
    }

    @PreAuthorize("hasRole('ADMIN')")
    public void deleteEmployee(String employeeId){
        if (!memberRepository.existsById(employeeId)){
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }
        memberRepository.deleteById(employeeId);
    }
}
