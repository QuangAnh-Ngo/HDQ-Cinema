// frontend/src/services/paymentService.js
import axiosInstance from "./axiosInstance";

export const paymentService = {
  /**
   * ✅ Tạo payment URL
   * POST /payment/create_payment
   * Request: { bookingId }
   * Response: { status, message, url }
   */
  create: async (bookingId) => {
    try {
      const payload = {
        bookingId: bookingId,
      };

      console.log("💳 Creating payment for booking:", bookingId);

      const response = await axiosInstance.post(
        "/payment/create_payment",
        payload
      );

      console.log("✅ Payment response:", response);

      // Response structure: { status, message, url }
      return response;
    } catch (error) {
      console.error("Create payment error:", error);
      throw error;
    }
  },

  /**
   * ✅ Xử lý VNPay callback
   * GET /payment/payment_infor
   * Query params: vnp_Amount, vnp_BankCode, vnp_OrderInfo, vnp_ResponseCode, vnp_TxnRef
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
          vnp_TxnRef: vnpayParams.vnp_TxnRef,
        },
      });

      console.log("✅ Callback response:", response);

      return response;
    } catch (error) {
      console.error("Payment callback error:", error);
      throw error;
    }
  },

  /**
   * ✅ Lấy lịch sử payment của member
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

  /**
   * Utility: Kiểm tra payment thành công
   */
  isPaymentSuccessful: (responseCode) => {
    return responseCode === "00";
  },

  /**
   * Utility: Parse callback URL
   */
  parseVNPayCallback: (url) => {
    const urlObj = new URL(url);
    const params = {};
    urlObj.searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  },

  /**
   * Utility: Format payment history
   */
  formatHistory: (history) => {
    return history.map((payment) => ({
      ...payment,
      formattedDate: new Date(payment.createdAt).toLocaleString("vi-VN"),
      formattedAmount:
        new Intl.NumberFormat("vi-VN").format(payment.amount) + " VNĐ",
    }));
  },
};

export default paymentService;
