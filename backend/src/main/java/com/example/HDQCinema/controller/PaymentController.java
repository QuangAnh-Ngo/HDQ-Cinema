package com.example.HDQCinema.controller;

import com.example.HDQCinema.configuration.PaymentConfig;
import com.example.HDQCinema.dto.response.PaymentResponse;
import com.example.HDQCinema.dto.response.ApiResponse;
import com.example.HDQCinema.service.PaymentService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@RestController
@RequestMapping("/payment")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class PaymentController {

    PaymentService paymentService;

    @GetMapping("/create_payment")
    public ApiResponse<PaymentResponse> createPayment() throws UnsupportedEncodingException {
        var response = paymentService.createPayment();

        return ApiResponse.<PaymentResponse>builder()
                .result(response)
                .build();
    }

    @GetMapping("/payment_infor")
    ApiResponse<String> transaction(
            @RequestParam(value = "vnp_Amount") String amount,
            @RequestParam(value = "vnp_BankCode") String bankCode,
            @RequestParam(value = "vnp_OrderInfo") String orderInfor,
            @RequestParam(value = "vnp_ResponseCode") String responseCode
    ){
        var response = paymentService.transactionResult(amount, bankCode, orderInfor, responseCode);
        return ApiResponse.<String>builder()
                .result(response)
                .build();
    }
}
