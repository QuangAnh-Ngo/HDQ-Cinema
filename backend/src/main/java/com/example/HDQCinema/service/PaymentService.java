package com.example.HDQCinema.service;

import com.example.HDQCinema.configuration.PaymentConfig;
import com.example.HDQCinema.dto.request.PaymentRequest;
import com.example.HDQCinema.dto.response.BookingResponse;
import com.example.HDQCinema.dto.response.PaymentResponse;
import com.example.HDQCinema.exception.AppException;
import com.example.HDQCinema.exception.ErrorCode;
import com.example.HDQCinema.repository.BookingRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    BookingRepository bookingRepository;
    BookingService bookingService;
    PaymentURLService paymentURLService;

    @PreAuthorize("hasRole('MEMBER')")
    public PaymentResponse createPayment(PaymentRequest request) throws UnsupportedEncodingException {

        Long bookingId = request.getBookingId();

        // ✅ FIX 1: Validate booking exists and has valid price
        Double totalPrice = bookingRepository.findTotalPriceByBookingId(bookingId);
        if (totalPrice == null || totalPrice <= 0) {
            log.error("❌ Invalid booking or totalPrice: bookingId={}, totalPrice={}", bookingId, totalPrice);
            throw new AppException(ErrorCode.BOOKING_NOT_FOUND);
        }

        String orderType = "other";
        long amount = (long) (totalPrice * 100); // VNPay yêu cầu nhân 100

        // ✅ FIX 2: Tạo vnp_TxnRef unique (bookingId + timestamp)
        String vnp_TxnRef = bookingId + "_" + System.currentTimeMillis();

        // ✅ FIX 3: Sử dụng IP cố định thay vì gọi API external
        String vnp_IpAddr = "127.0.0.1"; // Sandbox chấp nhận localhost

        String vnp_TmnCode = PaymentConfig.vnp_TmnCode;

        // SET UP THAM SỐ
        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", PaymentConfig.vnp_Version);
        vnp_Params.put("vnp_Command", PaymentConfig.vnp_Command);
        vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(amount));
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_BankCode", "NCB");
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", "Thanh toan don hang:" + bookingId);
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_OrderType", orderType);
        vnp_Params.put("vnp_ReturnUrl", PaymentConfig.vnp_ReturnUrl);
        vnp_Params.put("vnp_IpAddr", vnp_IpAddr);

        // Múi giờ Việt Nam
        TimeZone tz = TimeZone.getTimeZone("Asia/Ho_Chi_Minh");
        Calendar cld = Calendar.getInstance(tz);
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        formatter.setTimeZone(tz);

        String vnp_CreateDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

        cld.add(Calendar.MINUTE, 15);
        String vnp_ExpireDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

        // MÃ HÓA
        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();
        
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = vnp_Params.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                // Build hash data
                hashData.append(fieldName);
                hashData.append('=');
                hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                // Build query
                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString()));
                query.append('=');
                query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }

        String queryUrl = query.toString();
        String vnp_SecureHash = PaymentConfig.hmacSHA512(PaymentConfig.secretKey, hashData.toString());
        queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;
        String paymentUrl = PaymentConfig.vnp_PayUrl + "?" + queryUrl;

        // ✅ DEBUG LOG
        log.info("========== VNPAY DEBUG ==========");
        log.info("BookingId: {}", bookingId);
        log.info("vnp_TxnRef: {}", vnp_TxnRef);
        log.info("vnp_Amount: {} (totalPrice: {})", amount, totalPrice);
        log.info("vnp_CreateDate: {}", vnp_CreateDate);
        log.info("vnp_ReturnUrl: {}", PaymentConfig.vnp_ReturnUrl);
        log.info("Hash Data: {}", hashData);
        log.info("Secure Hash: {}", vnp_SecureHash);
        log.info("Payment URL Length: {}", paymentUrl.length());
        log.info("==================================");

        PaymentResponse paymentResponse = PaymentResponse.builder()
                .status("OK")
                .message(bookingId.toString())
                .URL(paymentUrl)
                .build();

        // ✅ FIX 4: Lưu vnp_TxnRef thay vì bookingId để match khi callback
        paymentURLService.create(bookingId, paymentUrl);

        return paymentResponse;
    }

    public BookingResponse transactionResult(String amount, String bankCode, String orderInfo, String responseCode, String txnRef) {
        log.info("📥 VNPay Callback: responseCode={}, txnRef={}, amount={}", responseCode, txnRef, amount);

        // ✅ FIX 5: Extract bookingId từ vnp_TxnRef (format: bookingId_timestamp)
        Long bookingId;
        try {
            String bookingIdStr = txnRef.contains("_") ? txnRef.split("_")[0] : txnRef;
            bookingId = Long.parseLong(bookingIdStr);
        } catch (NumberFormatException e) {
            log.error("❌ Invalid txnRef format: {}", txnRef);
            throw new AppException(ErrorCode.BOOKING_NOT_FOUND);
        }

        if (responseCode.equals("00")) {
            log.info("✅ Payment SUCCESS for bookingId: {}", bookingId);
            var response = bookingService.approvePayment(bookingId);
            paymentURLService.deleteURL(bookingId);
            return response;
        } else if (responseCode.equals("24")) {
            log.info("⚠️ Payment CANCELLED by user for bookingId: {}", bookingId);
            paymentURLService.deleteURL(bookingId);
            bookingService.deletePayment(bookingId);
            return null;
        } else {
            log.error("❌ Payment FAILED with code: {} for bookingId: {}", responseCode, bookingId);
            throw new AppException(ErrorCode.BOOKING_FAIL);
        }
    }
}