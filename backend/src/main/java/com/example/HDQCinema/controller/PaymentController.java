package com.example.HDQCinema.controller;

import com.example.HDQCinema.dto.request.PaymentRequest;
import com.example.HDQCinema.dto.response.BookingResponse;
import com.example.HDQCinema.dto.response.PaymentResponse;
import com.example.HDQCinema.dto.response.ApiResponse;
import com.example.HDQCinema.service.PaymentService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.UnsupportedEncodingException;

@RestController
@RequestMapping("/payment")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    PaymentService paymentService;

    @PostMapping("/create_payment")
    @PreAuthorize("hasAuthority('PAYMENT')")
    public ApiResponse<PaymentResponse> createPayment(@RequestBody PaymentRequest request) throws UnsupportedEncodingException {
        var response = paymentService.createPayment(request);

        return ApiResponse.<PaymentResponse>builder()
                .result(response)
                .build();
    }

    @GetMapping("/payment_infor")
    ApiResponse<?> transaction(
            @RequestParam(value = "vnp_Amount") String amount,
            @RequestParam(value = "vnp_BankCode") String bankCode,
            @RequestParam(value = "vnp_OrderInfo") String orderInfo,
            @RequestParam(value = "vnp_ResponseCode") String responseCode,
            @RequestParam(value = "vnp_TxnRef") String txnRef  // ✅ FIX: Đổi từ Long thành String
    ){
        log.info("📥 VNPay Callback received: responseCode={}, txnRef={}, amount={}", 
                 responseCode, txnRef, amount);
        
        var response = paymentService.transactionResult(amount, bankCode, orderInfo, responseCode, txnRef);
        
        if (response != null) {
            return ApiResponse.<BookingResponse>builder()
                    .result(response)
                    .build();
        } else {
            return ApiResponse.<String>builder()
                    .result("cancel success")
                    .build();
        }
    }
}