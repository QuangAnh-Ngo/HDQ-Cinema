package com.example.HDQCinema.mapper;

import com.example.HDQCinema.dto.request.UserCreationRequest;
import com.example.HDQCinema.dto.request.UserUpdateRequest;
import com.example.HDQCinema.dto.response.UserResponse;
import com.example.HDQCinema.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface UserMapper {
    @Mapping(target = "roles", ignore = true)
    User toUser(UserCreationRequest request);
    UserResponse toUserResponse(User user);

    User updateUser(@MappingTarget User user, UserUpdateRequest request);
}
