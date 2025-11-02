package com.example.HDQCinema.controller;

import com.example.HDQCinema.dto.response.ApiResponse;
import com.example.HDQCinema.dto.response.PaymentURLResponse;
import com.example.HDQCinema.service.PaymentService;
import com.example.HDQCinema.service.PaymentURLService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/paymenturls")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PaymentURLController {
    PaymentURLService paymentURLService;

    @GetMapping("/{memberId}")
    ApiResponse<List<PaymentURLResponse>> getURLFromMember(@PathVariable("memberId") String memberId){
        var response = paymentURLService.getURLFromMember(memberId);
        return ApiResponse.<List<PaymentURLResponse>>builder()
                .result(response)
                .build();
    }
}
