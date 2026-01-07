// frontend/src/services/bookingService.js
import axiosInstance from "./axiosInstance";

export const bookingService = {
  /**
   * Lấy danh sách booking phân trang với filter và sort (Server-side)
   * GET /bookings/paged?page=0&size=50&keyword=xxx&status=PENDING&sortBy=id&sortDir=desc
   */
  getPaged: async (params = {}) => {
    try {
      // 🔍 DEBUG: Log request params
      console.log("📤 [BookingService] getPaged - Request params:", {
        page: params.page || 0,
        size: params.size || 50,
        keyword: params.keyword || null,
        status: params.status || null,
        sortBy: params.sortBy || "id",
        sortDir: params.sortDir || "desc",
      });

      const response = await axiosInstance.get("/bookings/paged", {
        params: {
          page: params.page || 0,
          size: params.size || 50,
          keyword: params.keyword || null,
          status: params.status || null,
          sortBy: params.sortBy || "id",
          sortDir: params.sortDir || "desc",
        },
      });

      // 🔍 DEBUG: Log full response
      console.log("📥 [BookingService] getPaged - Full response:", response);
      console.log("📥 [BookingService] getPaged - Response type:", typeof response);
      console.log("📥 [BookingService] getPaged - Response keys:", response ? Object.keys(response) : "null");

      // 🔍 DEBUG: Check response structure
      if (response) {
        console.log("📥 [BookingService] getPaged - Data array:", response.data);
        console.log("📥 [BookingService] getPaged - Total pages:", response.totalPages);
        console.log("📥 [BookingService] getPaged - Total elements:", response.totalElements);
        console.log("📥 [BookingService] getPaged - Current page:", response.currentPage);

        // Check first booking item structure
        if (response.data && response.data.length > 0) {
          console.log("📥 [BookingService] getPaged - First booking item:", response.data[0]);
          console.log("📥 [BookingService] getPaged - First item keys:", Object.keys(response.data[0]));
        }
      }

      return response;
    } catch (error) {
      // 🔍 DEBUG: Log error details
      console.error("❌ [BookingService] getPaged - Error:", error);
      console.error("❌ [BookingService] getPaged - Error status:", error.status);
      console.error("❌ [BookingService] getPaged - Error response:", error.response);
      throw error;
    }
  },

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
   */
  getByDate: async (date) => {
    try {
      const response = await axiosInstance.get(`/bookings/date/${date}`);
      return response || [];
    } catch (error) {
      console.error("Get bookings by date error:", error);
      throw error;
    }
  },

  /**
   * Lấy số lượng booking pending
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
   * ✅ FIX: Tạo booking mới
   * POST /bookings
   * Request: { memberId, showTimeId, cinemaId, bookingDetailRequests: [{ seatId }] }
   */
  create: async (data) => {
    try {
      // ✅ FIX: Use memberId instead of userId
      const payload = {
        memberId: data.memberId || data.userId, // ✅ FIXED!
        showTimeId: parseInt(data.showTimeId, 10),
        cinemaId: parseInt(data.cinemaId, 10),
        bookingDetailRequests: data.seats.map((seatId) => ({
          seatId: parseInt(seatId, 10),
        })),
      };

      console.log("📦 Booking payload:", payload);

      const response = await axiosInstance.post("/bookings", payload);

      console.log("✅ Booking response:", response);

      return response;
    } catch (error) {
      console.error("❌ Create booking error:", error);
      throw error;
    }
  },

  /**
   * Utility: Format booking cho UI
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
