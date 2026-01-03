package com.example.HDQCinema.mapper;

import com.example.HDQCinema.dto.request.MemberCreationRequest;
import com.example.HDQCinema.dto.request.MemberUpdateRequest;
import com.example.HDQCinema.dto.response.MemberResponse;
import com.example.HDQCinema.entity.Member;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface MemberMapper {
    @Mapping(target = "bookings", ignore = true)
    @Mapping(target = "paymentURLS", ignore = true)
    Member toMember(MemberCreationRequest request);

    MemberResponse toMemberResponse(Member member);

    @Mapping(target = "bookings", ignore = true)
    @Mapping(target = "paymentURLS", ignore = true)
    Member updateMember(@MappingTarget Member member, MemberUpdateRequest request);
}
