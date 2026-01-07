// frontend/src/services/showtimeService.js
import axiosInstance from "./axiosInstance";

export const showtimeService = {
  /**
   * Lấy danh sách tất cả suất chiếu
   * Response: [{ showtimeId, movieId, movieTitle, startTime, roomId, roomName, cinemaId, cinemaName }]
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
   * Lấy suất chiếu trong 7 ngày tới (có thể lọc theo cinema và movie)
   * Response: [{ showtimeId, movieId, movieTitle, startTime, roomId, roomName, cinemaId, cinemaName }]
   */
  getNext7Days: async (cinemaId = null, movieId = null) => {
    try {
      const params = new URLSearchParams();
      if (cinemaId) params.append("cinemaId", cinemaId);
      if (movieId) params.append("movieId", movieId);

      const url = `/showtimes/next-7-days${params.toString() ? `?${params.toString()}` : ""}`;
      const response = await axiosInstance.get(url);
      return response || [];
    } catch (error) {
      console.error("Get next 7 days showtimes error:", error);
      throw error;
    }
  },

  /**
   * Lấy suất chiếu trong 7 ngày tới với phân trang
   */
  getNext7DaysPaged: async (page = 0, size = 50, cinemaId = null, movieId = null) => {
    try {
      const params = new URLSearchParams({ page, size });
      if (cinemaId) params.append("cinemaId", cinemaId);
      if (movieId) params.append("movieId", movieId);

      const response = await axiosInstance.get(`/showtimes/next-7-days/paged?${params.toString()}`);
      return response;
    } catch (error) {
      console.error("Get next 7 days showtimes paged error:", error);
      throw error;
    }
  },

  /**
   * Lấy suất chiếu phân trang với tìm kiếm
   */
  getPaged: async (page = 0, size = 50, keyword = "", sortBy = "startTime", sortDir = "asc") => {
    try {
      const params = new URLSearchParams({ page, size, sortBy, sortDir });
      if (keyword) params.append("keyword", keyword);

      const response = await axiosInstance.get(`/showtimes/paged?${params.toString()}`);
      return response;
    } catch (error) {
      console.error("Get showtimes paged error:", error);
      throw error;
    }
  },

  /**
   * Lấy chi tiết suất chiếu theo ID
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
   * Tạo suất chiếu mới
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
   * Cập nhật suất chiếu
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
   * Utility: Phân nhóm suất chiếu theo ngày
   * Input: [{ showtimeId, startTime, roomId, roomName, ... }]
   */
  groupByDate: (showtimes) => {
    if (!Array.isArray(showtimes)) return {};

    const grouped = {};

    showtimes.forEach((showtime) => {
      const date = showtime.startTime?.split("T")[0];
      if (!date) return;

      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(showtime);
    });

    return grouped;
  },

  /**
   * Format thời gian hiển thị
   */
  formatTime: (isoDateTime) => {
    if (!isoDateTime) return "";
    const time = isoDateTime.split("T")[1];
    return time?.substring(0, 5) || "";
  },
};

export default showtimeService;
