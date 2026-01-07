// frontend/src/services/showtimeService.js
import axiosInstance from "./axiosInstance";

export const showtimeService = {
  /**
   * ✅ NEW: Search with pagination and filters (Main method for admin)
   */
  search: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();

      // Pagination
      queryParams.append("page", params.page ?? 0);
      queryParams.append("size", params.size ?? 20);

      // Sorting
      queryParams.append("sortBy", params.sortBy ?? "startTime");
      queryParams.append("sortDir", params.sortDir ?? "desc");

      // Filters
      if (params.movieId) queryParams.append("movieId", params.movieId);
      if (params.cinemaId) queryParams.append("cinemaId", params.cinemaId);
      if (params.roomId) queryParams.append("roomId", params.roomId);
      if (params.dateFrom) queryParams.append("dateFrom", params.dateFrom);
      if (params.dateTo) queryParams.append("dateTo", params.dateTo);
      if (params.status && params.status !== "all")
        queryParams.append("status", params.status);
      if (params.search) queryParams.append("search", params.search);

      const response = await axiosInstance.get(
        `/showtimes/search?${queryParams.toString()}`
      );
      return response;
    } catch (error) {
      console.error("Search showtimes error:", error);
      throw error;
    }
  },

  /**
   * ✅ NEW: Get statistics
   */
  getStatistics: async () => {
    try {
      const response = await axiosInstance.get("/showtimes/statistics");
      return response || { total: 0, upcoming: 0, today: 0 };
    } catch (error) {
      console.error("Get statistics error:", error);
      return { total: 0, upcoming: 0, today: 0 };
    }
  },

  /**
   * ✅ Get by ID
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
   * ✅ Get upcoming by movie (for ScheduleModal)
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
   * ✅ Get upcoming by cinema
   */
  getByCinema: async (cinemaId) => {
    try {
      const response = await axiosInstance.get(`/showtimes/cinema/${cinemaId}`);
      return response || [];
    } catch (error) {
      console.error("Get showtimes by cinema error:", error);
      throw error;
    }
  },

  /**
   * ✅ Legacy: Get all (deprecated - use search instead)
   */
  getAll: async () => {
    try {
      console.warn("⚠️ Using deprecated getAll() - consider using search()");
      const response = await axiosInstance.get("/showtimes");
      return response || [];
    } catch (error) {
      console.error("Get all showtimes error:", error);
      throw error;
    }
  },

  /**
   * Create showtime
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
   * Update showtime
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
   * Delete showtime
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
   * ✅ Utility: Group showtimes by date
   */
  groupByDate: (showtimes) => {
    if (!Array.isArray(showtimes)) return {};

    return showtimes.reduce((acc, st) => {
      const date = st.date || st.startTime?.split("T")[0];
      if (!date) return acc;

      if (!acc[date]) acc[date] = [];
      acc[date].push(st);
      return acc;
    }, {});
  },
};

export default showtimeService;
