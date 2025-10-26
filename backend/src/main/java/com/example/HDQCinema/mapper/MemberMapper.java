package com.example.HDQCinema.mapper;

import com.example.HDQCinema.dto.request.EmployeeAccountCreationRequest;
import com.example.HDQCinema.dto.request.EmployeeAccountUpdateRequest;
import com.example.HDQCinema.dto.response.EmployeeAccountResponse;
import com.example.HDQCinema.entity.Member;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface MemberMapper {
    Member updateUser(@MappingTarget Member user, EmployeeAccountUpdateRequest request);
//    @Mapping(target = "roles", ignore = true)
    Member toUser(EmployeeAccountCreationRequest request);
    EmployeeAccountResponse toUserResponse(Member member);
}
