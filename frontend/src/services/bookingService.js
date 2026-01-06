// frontend/src/services/bookingService.js
import axiosInstance from "./axiosInstance";

export const bookingService = {
  /**
   * ✅ Lấy danh sách booking của member
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
   * ✅ Lấy danh sách booking theo ngày
   * GET /bookings/date/{date}
   */
  getByDate: async (date) => {
    try {
      // date format: "YYYY-MM-DD"
      const response = await axiosInstance.get(`/bookings/date/${date}`);
      return response || [];
    } catch (error) {
      console.error("Get bookings by date error:", error);
      throw error;
    }
  },

  /**
   * ✅ Lấy số lượng booking pending
   * GET /bookings/pending
   */
  getPendingCount: async () => {
    try {
      const response = await axiosInstance.get("/bookings/pending");
      return response?.amount || 0;
    } catch (error) {
      console.error("Get pending bookings error:", error);
      throw error;
    }
  },

  /**
   * ✅ Tạo booking mới
   * POST /bookings
   * Request: { userId, showTimeId, cinemaId, bookingDetailRequests: [{ seatId }] }
   */
  create: async (data) => {
    try {
      const payload = {
        userId: data.userId,
        showTimeId: data.showTimeId,
        cinemaId: data.cinemaId,
        bookingDetailRequests: data.seats.map((seatId) => ({
          seatId: seatId,
        })),
      };

      console.log("📦 Booking payload:", payload);

      const response = await axiosInstance.post("/bookings", payload);

      console.log("✅ Booking response:", response);

      // Response structure: { id, totalPrice, createTime, username, showTime, seats }
      return response;
    } catch (error) {
      console.error("Create booking error:", error);
      throw error;
    }
  },

  /**
   * ✅ Utility: Format booking cho UI
   */
  formatBooking: (booking) => {
    return {
      ...booking,
      bookingId: booking.id,
      formattedPrice:
        new Intl.NumberFormat("vi-VN").format(booking.totalPrice) + " VNĐ",
      formattedDate: new Date(booking.createTime).toLocaleString("vi-VN"),
      formattedShowTime: new Date(booking.showTime).toLocaleString("vi-VN"),
    };
  },
};

export default bookingService;
