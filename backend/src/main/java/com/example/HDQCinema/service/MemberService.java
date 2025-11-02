package com.example.HDQCinema.service;

import com.example.HDQCinema.dto.request.MemberCreationRequest;
import com.example.HDQCinema.dto.response.MemberResponse;
import com.example.HDQCinema.entity.Member;
import com.example.HDQCinema.mapper.MemberMapper;
import com.example.HDQCinema.repository.MemberRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class MemberService {
    MemberRepository memberRepository;
    MemberMapper memberMapper;

    public MemberResponse createUser(MemberCreationRequest request){
        Member member = memberMapper.toUser(request);

        memberRepository.save(member);
        return memberMapper.toUserResponse(member);
    }
}
