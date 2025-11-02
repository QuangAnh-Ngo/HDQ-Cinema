package com.example.HDQCinema.mapper;

import com.example.HDQCinema.dto.response.PaymentURLResponse;
import com.example.HDQCinema.entity.Member;
import com.example.HDQCinema.entity.PaymentURL;
import com.example.HDQCinema.repository.MemberRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.UUID;

@Mapper(componentModel = "spring")
public interface PaymentURLMapper {
    PaymentURLResponse toResponse(PaymentURL paymentURL);
    List<PaymentURLResponse> toResponses(List<PaymentURL> paymentURLS);
}