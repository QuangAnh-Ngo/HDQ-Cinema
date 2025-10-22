package com.example.HDQCinema.service;

import com.example.HDQCinema.dto.request.UserCreationRequest;
import com.example.HDQCinema.dto.request.UserUpdateRequest;
import com.example.HDQCinema.dto.response.UserResponse;
import com.example.HDQCinema.entity.User;
import com.example.HDQCinema.mapper.UserMapper;
import com.example.HDQCinema.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserService {
    UserRepository userRepository;
    UserMapper userMapper;

    public UserResponse createUser(UserCreationRequest request){
        User user = userMapper.toUser(request);

        userRepository.save(user);
        return userMapper.toUserResponse(user);
    }

    public List<UserResponse> getUser(){
        List<User> users = userRepository.findAll();

        return users.stream()
                .map(userMapper::toUserResponse)
                .toList();
    }

    public UserResponse updateUser(String userId, UserUpdateRequest request){
        User user = userRepository.findById(userId)
                .orElseThrow(()-> new RuntimeException("User not found"));

        return userMapper.toUserResponse(userMapper.updateUser(user, request));
    }

    public void deleteUser(String userId){
        if (!userRepository.existsById(userId)){
            throw new RuntimeException("User not found");
        }
        userRepository.deleteById(userId);
    }

}
