// frontend/src/services/showtimeService.js
import axiosInstance from "./axiosInstance";

export const showtimeService = {
  /**
   * ✅ FIX: Lấy danh sách tất cả suất chiếu
   * Response: { code, message, result: [{ showtimeId, movieId, showTimeRooms: [...] }] }
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
   * ✅ FIX: Lấy chi tiết suất chiếu theo ID
   * Response: { code, message, result: { showtimeId, movieId, showTimeRooms: [...] } }
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
   * Lấy danh sách suất chiếu theo phim
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
   * Lấy danh sách suất chiếu theo phòng
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
   * ✅ FIX: Tạo suất chiếu mới
   * Payload: { movieId, showTimeRooms: [{ showTime, roomId }] }
   */
  create: async (data) => {
    try {
      const payload = {
        movieId: data.movieId,
        showTimeRooms: data.showTimeRooms || [
          {
            showTime: data.showTime,
            roomId: data.roomId,
          },
        ],
      };
      const response = await axiosInstance.post("/showtimes", payload);
      return response;
    } catch (error) {
      console.error("Create showtime error:", error);
      throw error;
    }
  },

  /**
   * ✅ FIX: Cập nhật suất chiếu
   */
  update: async (id, data) => {
    try {
      const payload = {
        movieId: data.movieId,
        showTimeRooms: data.showTimeRooms || [
          {
            showTime: data.showTime,
            roomId: data.roomId,
          },
        ],
      };
      const response = await axiosInstance.put(`/showtimes/${id}`, payload);
      return response;
    } catch (error) {
      console.error("Update showtime error:", error);
      throw error;
    }
  },

  /**
   * Xóa suất chiếu
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
   * ✅ Utility: Phân nhóm suất chiếu theo ngày
   * Input: [{ showtimeId, movieId, showTimeRooms: [{ showTime, roomId }] }]
   */
  groupByDate: (showtimes) => {
    if (!Array.isArray(showtimes)) return {};

    const grouped = {};

    showtimes.forEach((showtime) => {
      showtime.showTimeRooms?.forEach((str) => {
        const date = str.showTime.split("T")[0];
        if (!grouped[date]) {
          grouped[date] = [];
        }
        grouped[date].push({
          ...showtime,
          showTime: str.showTime,
          roomId: str.roomId,
        });
      });
    });

    return grouped;
  },

  /**
   * Format thời gian hiển thị
   */
  formatTime: (isoDateTime) => {
    const time = isoDateTime.split("T")[1];
    return time.substring(0, 5);
  },
};

export default showtimeService;
