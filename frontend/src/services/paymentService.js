// frontend/src/services/paymentService.js
import axiosInstance from "./axiosInstance";

export const paymentService = {
  /**
   * Tạo yêu cầu thanh toán VNPay (POST /payment/create_payment)
   * @param {string} bookingId - Booking ID
   * @returns {Promise<Object>} Response chứa payment URL
   */
  create: async (bookingId) => {
    try {
      const payload = {
        bookingId: bookingId,
      };

      const response = await axiosInstance.post(
        "/payment/create_payment",
        payload
      );

      // Response có thể chứa paymentUrl để redirect user
      return response;
    } catch (error) {
      console.error("Create payment error:", error);
      throw error;
    }
  },

  /**
   * Xử lý callback từ VNPay (GET /payment/payment_infor)
   * VNPay sẽ redirect về URL này với query params
   * @param {Object} vnpayParams - Query params từ VNPay callback
   * @returns {Promise<Object>} Thông tin kết quả thanh toán
   */
  handleCallback: async (vnpayParams) => {
    try {
      const response = await axiosInstance.get("/payment/payment_infor", {
        params: vnpayParams,
      });

      // Response chứa thông tin: success/failure, transactionId, amount, etc.
      return response;
    } catch (error) {
      console.error("Payment callback error:", error);
      throw error;
    }
  },

  /**
   * Lấy lịch sử payment URLs của member (GET /paymenturls/{memberId})
   * @param {string} memberId - Member ID
   * @returns {Promise<Array>} Array of payment history
   */
  getHistoryByMember: async (memberId) => {
    try {
      const response = await axiosInstance.get(`/paymenturls/${memberId}`);

      // Response structure: Array of { createdAt, amount, url }
      return response || [];
    } catch (error) {
      console.error("Get payment history error:", error);
      throw error;
    }
  },

  /**
   * Parse VNPay return URL params (Utility function)
   * @param {string} url - Full callback URL from VNPay
   * @returns {Object} Parsed query params
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
   * Kiểm tra trạng thái thanh toán thành công (Utility function)
   * @param {Object} callbackResponse - Response từ handleCallback
   * @returns {boolean}
   */
  isPaymentSuccessful: (callbackResponse) => {
    // VNPay thường trả về vnp_ResponseCode
    // "00" = Success, khác "00" = Failed
    return callbackResponse?.vnp_ResponseCode === "00";
  },

  /**
   * Format payment history cho UI (Utility function)
   * @param {Array} history - Array từ getHistoryByMember
   * @returns {Array} Formatted array
   */
  formatHistory: (history) => {
    return history.map((payment) => ({
      ...payment,
      createdAt: new Date(payment.createdAt).toLocaleString("vi-VN"),
      amount: new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(payment.amount),
    }));
  },
};

export default paymentService;
