package com.example.HDQCinema.service;

import com.example.HDQCinema.dto.request.UserCreationRequest;
import com.example.HDQCinema.dto.response.UserResponse;
import com.example.HDQCinema.entity.Member;
import com.example.HDQCinema.mapper.UserMapper;
import com.example.HDQCinema.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserService {
    UserRepository userRepository;
    UserMapper userMapper;

    public UserResponse createUser(UserCreationRequest request){
        Member member = userMapper.toUser(request);

        userRepository.save(member);
        return userMapper.toUserResponse(member);
    }
}
