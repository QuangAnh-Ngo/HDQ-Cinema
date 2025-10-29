package com.example.HDQCinema.service;

import com.example.HDQCinema.dto.request.UserCreationRequest;
import com.example.HDQCinema.dto.response.UserResponse;
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
public class UserService {
    MemberRepository memberRepository;
    MemberMapper memberMapper;

    public UserResponse createUser(UserCreationRequest request){
        Member member = memberMapper.toUser(request);

        memberRepository.save(member);
        return memberMapper.toUserResponse(member);
    }
}
