package com.example.HDQCinema.mapper;

import com.example.HDQCinema.dto.request.UserCreationRequest;
import com.example.HDQCinema.dto.response.UserResponse;
import com.example.HDQCinema.entity.Member;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface MemberMapper {
//    @Mapping(target = "roles", ignore = true)
    Member toUser(UserCreationRequest request);
    UserResponse toUserResponse(Member member);
}
