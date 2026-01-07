// frontend/src/services/paymentService.js
import axiosInstance from "./axiosInstance";

export const paymentService = {
  /**
   * ✅ FIX: Tạo payment URL
   * POST /payment/create_payment
   * Request: { bookingId }
   * Response: { code, message, result: { status, message, url } }
   */
  create: async (bookingId) => {
    try {
      const payload = {
        bookingId: parseInt(bookingId, 10), // ✅ Ensure number type
      };

      console.log("💳 Creating payment for booking:", bookingId);

      const response = await axiosInstance.post(
        "/payment/create_payment",
        payload
      );

      console.log("✅ Payment response:", response);

      // ✅ FIX: Handle nested response structure
      // Response could be: response.result or just response
      const result = response?.result || response;

      return {
        status: result?.status,
        message: result?.message,
        url: result?.url,
      };
    } catch (error) {
      console.error("❌ Create payment error:", error);
      throw error;
    }
  },

  /**
   * ✅ FIX: Xử lý VNPay callback
   * GET /payment/payment_infor
   */
  handleCallback: async (vnpayParams) => {
    try {
      console.log("🔄 Processing VNPay callback:", vnpayParams);

      const response = await axiosInstance.get("/payment/payment_infor", {
        params: {
          vnp_Amount: vnpayParams.vnp_Amount,
          vnp_BankCode: vnpayParams.vnp_BankCode,
          vnp_OrderInfo: vnpayParams.vnp_OrderInfo,
          vnp_ResponseCode: vnpayParams.vnp_ResponseCode,
          vnp_TxnRef: parseInt(vnpayParams.vnp_TxnRef, 10), // ✅ Must be integer
        },
      });

      console.log("✅ Callback response:", response);

      return response;
    } catch (error) {
      console.error("❌ Payment callback error:", error);
      throw error;
    }
  },

  /**
   * Lấy lịch sử payment của member
   * GET /paymenturls/{memberId}
   */
  getHistoryByMember: async (memberId) => {
    try {
      const response = await axiosInstance.get(`/paymenturls/${memberId}`);
      return response || [];
    } catch (error) {
      console.error("Get payment history error:", error);
      throw error;
    }
  },

  isPaymentSuccessful: (responseCode) => {
    return responseCode === "00";
  },
};

export default paymentService;
