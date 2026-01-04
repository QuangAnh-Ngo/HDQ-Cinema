// frontend/src/services/showtimeService.js
import axiosInstance from "./axiosInstance";

export const showtimeService = {
  /**
   * Lấy danh sách tất cả suất chiếu (GET /showtimes)
   * @returns {Promise<Array>}
   */
  getAll: async () => {
    try {
      const response = await axiosInstance.get("/showtimes");
      return response || [];
    } catch (error) {
      console.error("Get all showtimes error:", error);
      throw error;
    }
  },

  /**
   * Lấy chi tiết suất chiếu theo ID (GET /showtimes/{showtimeId})
   * @param {string} id - Showtime ID
   * @returns {Promise<Object>}
   */
  getById: async (id) => {
    try {
      const response = await axiosInstance.get(`/showtimes/${id}`);
      return response;
    } catch (error) {
      console.error("Get showtime by ID error:", error);
      throw error;
    }
  },

  /**
   * Lấy danh sách suất chiếu theo phim (GET /showtimes/movie/{movieId})
   * @param {string} movieId - Movie ID
   * @returns {Promise<Array>}
   */
  getByMovie: async (movieId) => {
    try {
      const response = await axiosInstance.get(`/showtimes/movie/${movieId}`);
      return response || [];
    } catch (error) {
      console.error("Get showtimes by movie error:", error);
      throw error;
    }
  },

  /**
   * Lấy danh sách suất chiếu theo phòng (GET /showtimes/room/{roomId})
   * @param {string} roomId - Room ID
   * @returns {Promise<Array>}
   */
  getByRoom: async (roomId) => {
    try {
      const response = await axiosInstance.get(`/showtimes/room/${roomId}`);
      return response || [];
    } catch (error) {
      console.error("Get showtimes by room error:", error);
      throw error;
    }
  },

  /**
   * Tạo suất chiếu mới (POST /showtimes)
   * @param {Object} data - { movieId, roomId, showTime }
   * @returns {Promise<Object>}
   */
  create: async (data) => {
    try {
      const payload = {
        movieId: data.movieId,
        roomId: data.roomId,
        showTime: data.showTime, // ISO datetime: "2026-01-04T14:30:00Z"
      };
      const response = await axiosInstance.post("/showtimes", payload);
      return response;
    } catch (error) {
      console.error("Create showtime error:", error);
      throw error;
    }
  },

  /**
   * Cập nhật suất chiếu (PUT /showtimes/{showtimeId})
   * @param {string} id - Showtime ID
   * @param {Object} data - { movieId, roomId, showTime }
   * @returns {Promise<Object>}
   */
  update: async (id, data) => {
    try {
      const payload = {
        movieId: data.movieId,
        roomId: data.roomId,
        showTime: data.showTime,
      };
      const response = await axiosInstance.put(`/showtimes/${id}`, payload);
      return response;
    } catch (error) {
      console.error("Update showtime error:", error);
      throw error;
    }
  },

  /**
   * Xóa suất chiếu (DELETE /showtimes/{showtimeId})
   * @param {string} id - Showtime ID
   * @returns {Promise<void>}
   */
  delete: async (id) => {
    try {
      await axiosInstance.delete(`/showtimes/${id}`);
    } catch (error) {
      console.error("Delete showtime error:", error);
      throw error;
    }
  },

  /**
   * Phân nhóm suất chiếu theo ngày (Utility function cho UI)
   * @param {Array} showtimes - Mảng showtimes
   * @returns {Object} { "YYYY-MM-DD": [...showtimes] }
   */
  groupByDate: (showtimes) => {
    if (!Array.isArray(showtimes)) return {};

    return showtimes.reduce((groups, showtime) => {
      const date = showtime.showTime.split("T")[0]; // Lấy YYYY-MM-DD
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(showtime);
      return groups;
    }, {});
  },

  /**
   * Format thời gian hiển thị (Utility function)
   * @param {string} isoDateTime - "2026-01-04T14:30:00Z"
   * @returns {string} "14:30"
   */
  formatTime: (isoDateTime) => {
    const time = isoDateTime.split("T")[1];
    return time.substring(0, 5); // "HH:mm"
  },
};

export default showtimeService;
