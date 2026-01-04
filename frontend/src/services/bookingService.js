// frontend/src/services/bookingService.js
import axiosInstance from "./axiosInstance";

export const bookingService = {
  /**
   * Lấy danh sách tất cả booking (GET /bookings)
   * @returns {Promise<Array>}
   */
  getAll: async () => {
    try {
      const response = await axiosInstance.get("/bookings");
      return response || [];
    } catch (error) {
      console.error("Get all bookings error:", error);
      throw error;
    }
  },

  /**
   * Lấy chi tiết booking theo ID (GET /bookings/{bookingId})
   * @param {string} id - Booking ID
   * @returns {Promise<Object>}
   */
  getById: async (id) => {
    try {
      const response = await axiosInstance.get(`/bookings/${id}`);
      return response;
    } catch (error) {
      console.error("Get booking by ID error:", error);
      throw error;
    }
  },

  /**
   * Tạo booking mới (POST /bookings)
   * @param {Object} data - { showtimeId, seatIds }
   * @returns {Promise<Object>}
   */
  create: async (data) => {
    try {
      const payload = {
        showtimeId: data.showtimeId,
        seatIds: data.seatIds, // Array of seat IDs
      };
      const response = await axiosInstance.post("/bookings", payload);
      return response;
    } catch (error) {
      console.error("Create booking error:", error);
      throw error;
    }
  },

  /**
   * Cập nhật booking (PUT /bookings/{bookingId})
   * @param {string} id - Booking ID
   * @param {Object} data - { showtimeId, seatIds }
   * @returns {Promise<Object>}
   */
  update: async (id, data) => {
    try {
      const payload = {
        showtimeId: data.showtimeId,
        seatIds: data.seatIds,
      };
      const response = await axiosInstance.put(`/bookings/${id}`, payload);
      return response;
    } catch (error) {
      console.error("Update booking error:", error);
      throw error;
    }
  },

  /**
   * Hủy/Xóa booking (DELETE /bookings/{bookingId})
   * @param {string} id - Booking ID
   * @returns {Promise<void>}
   */
  delete: async (id) => {
    try {
      await axiosInstance.delete(`/bookings/${id}`);
    } catch (error) {
      console.error("Delete booking error:", error);
      throw error;
    }
  },
};

export default bookingService;
