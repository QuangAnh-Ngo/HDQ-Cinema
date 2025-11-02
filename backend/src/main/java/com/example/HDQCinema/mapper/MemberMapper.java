package com.example.HDQCinema.mapper;

import com.example.HDQCinema.dto.request.MemberCreationRequest;
import com.example.HDQCinema.dto.response.MemberResponse;
import com.example.HDQCinema.entity.Member;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface MemberMapper {
//    @Mapping(target = "roles", ignore = true)
    Member toUser(MemberCreationRequest request);
    MemberResponse toUserResponse(Member member);
}
