// frontend/src/services/bookingService.js
import axiosInstance from "./axiosInstance";

export const bookingService = {
  /**
   * Lấy danh sách booking của member
   * GET /bookings/member/{memberId}
   */
  getByMember: async (memberId) => {
    try {
      const response = await axiosInstance.get(`/bookings/member/${memberId}`);
      return response || [];
    } catch (error) {
      console.error("Get bookings by member error:", error);
      throw error;
    }
  },

  /**
   * Lấy danh sách booking theo ngày
   * GET /bookings/date/{date}
   * @param {string} date - Format: YYYY-MM-DD
   */
  getByDate: async (date) => {
    try {
      console.log("📅 Fetching bookings for date:", date);
      const response = await axiosInstance.get(`/bookings/date/${date}`);
      console.log("✅ Bookings response:", response);
      return response || [];
    } catch (error) {
      console.error("Get bookings by date error:", error);
      throw error;
    }
  },

  /**
   * Lấy số lượng booking pending
   * GET /bookings/pending
   * @returns {number} amount
   */
  getPendingCount: async () => {
    try {
      const response = await axiosInstance.get("/bookings/pending");
      // API returns { amount: number }
      return response?.amount || 0;
    } catch (error) {
      console.error("Get pending bookings error:", error);
      return 0; // Return 0 instead of throwing
    }
  },

  /**
   * Tạo booking mới
   * POST /bookings
   * Request: { memberId, showTimeId, cinemaId, bookingDetailRequests: [{ seatId }] }
   */
  create: async (data) => {
    try {
      const payload = {
        memberId: data.memberId || data.userId,
        showTimeId: parseInt(data.showTimeId, 10),
        cinemaId: parseInt(data.cinemaId, 10),
        bookingDetailRequests: data.seats.map((seatId) => ({
          seatId: parseInt(seatId, 10),
        })),
      };

      console.log("📦 Creating booking:", payload);

      const response = await axiosInstance.post("/bookings", payload);

      console.log("✅ Booking created:", response);

      return response;
    } catch (error) {
      console.error("❌ Create booking error:", error);
      throw error;
    }
  },

  /**
   * Utility: Format booking response
   */
  formatBooking: (booking) => {
    return {
      ...booking,
      bookingId: booking.id,
      formattedPrice:
        new Intl.NumberFormat("vi-VN").format(booking.totalPrice) + "đ",
      formattedDate: new Date(booking.createTime).toLocaleString("vi-VN"),
      formattedShowTime: new Date(booking.showTime).toLocaleString("vi-VN"),
      seatCount: booking.seats?.length || 0,
    };
  },
};

export default bookingService;
