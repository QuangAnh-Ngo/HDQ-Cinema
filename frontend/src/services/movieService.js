// frontend/src/services/movieService.js
import axiosInstance from "./axiosInstance";
import cinemaService from "./cinemaService";

export const movieService = {
  /**
   * Lấy danh sách phim đang chiếu (GET /movies/showing)
   * @param {string} cinemaId - Cinema ID (query param 'c')
   * @returns {Promise<Array>} Mảng các object phim
   */
  getShowing: async (cinemaId = "") => {
    try {
      // ✅ Chỉ gửi param 'c' nếu cinemaId có giá trị
      const params = cinemaId ? { c: cinemaId } : {};

      const response = await axiosInstance.get("/movies/showing", { params });
      return response || [];
    } catch (error) {
      console.error("Get showing movies error:", error);
      throw error;
    }
  },

  /**
   * Lấy danh sách phim sắp chiếu (GET /movies/upcoming)
   * @param {string} cinemaId - Cinema ID (query param 'c')
   * @returns {Promise<Array>} Mảng các object phim
   */
  getUpcoming: async (cinemaId = "") => {
    try {
      // ✅ Chỉ gửi param 'c' nếu cinemaId có giá trị
      const params = cinemaId ? { c: cinemaId } : {};

      const response = await axiosInstance.get("/movies/upcoming", { params });
      return response || [];
    } catch (error) {
      console.error("Get upcoming movies error:", error);
      throw error;
    }
  },

  /**
   * Lấy tất cả phim từ TẤT CẢ rạp (combine showing + upcoming)
   * Backend yêu cầu param 'c', nên phải loop qua tất cả cinemas
   * @returns {Promise<Array>} Mảng unique movies
   */
  getAll: async () => {
    try {
      console.log("🔧 movieService.getAll() - Fetching all movies...");

      const response = await axiosInstance.get("/movies");

      console.log("🔧 Total movies:", response?.length || 0);

      return response || [];
    } catch (error) {
      console.error("Get all movies error:", error);
      return [];
    }
  },

  /**
   * Lấy chi tiết phim theo ID (GET /movies/{movieId})
   * @param {string} id - Movie ID
   * @returns {Promise<Object>} Object phim với thông tin đầy đủ bao gồm showtimes
   */
  getById: async (id) => {
    try {
      const response = await axiosInstance.get(`/movies/${id}`);
      return response;
    } catch (error) {
      console.error("Get movie detail error:", error);
      throw error;
    }
  },

  /**
   * Tạo phim mới (POST /movies)
   * @param {Object} data - Dữ liệu phim
   * @returns {Promise<Object>} Object phim đã tạo
   */
  create: async (data) => {
    try {
      const payload = {
        title: data.title,
        poster: data.poster,
        duration: parseInt(data.duration, 10),
        limitAge: parseInt(data.limitAge, 10) || 0,
        dayStart: data.dayStart, // YYYY-MM-DD format
        dayEnd: data.dayEnd, // YYYY-MM-DD format
        director: data.director || "",
        genre: data.genre,
        description: data.description || "",
        trailer_url: data.trailer_url || "",
      };

      console.log("📤 Creating movie:", payload);

      const response = await axiosInstance.post("/movies", payload);

      console.log("✅ Movie created:", response);

      return response;
    } catch (error) {
      console.error("❌ Create movie error:", error);
      console.error("Response:", error.response?.data);
      throw error;
    }
  },

  /**
   * ✅ Update movie with correct field mapping
   */
  update: async (id, data) => {
    try {
      const payload = {
        title: data.title,
        poster: data.poster,
        duration: parseInt(data.duration, 10),
        limitAge: parseInt(data.limitAge, 10) || 0,
        dayStart: data.dayStart,
        dayEnd: data.dayEnd,
        director: data.director || "",
        genre: data.genre,
        description: data.description || "",
        trailer_url: data.trailer_url || "",
      };

      console.log("📤 Updating movie:", id, payload);

      const response = await axiosInstance.put(`/movies/${id}`, payload);

      console.log("✅ Movie updated:", response);

      return response;
    } catch (error) {
      console.error("❌ Update movie error:", error);
      console.error("Response:", error.response?.data);
      throw error;
    }
  },

  /**
   * ✅ Delete movie with proper error handling
   */
  delete: async (id) => {
    try {
      console.log("📤 Deleting movie:", id);

      await axiosInstance.delete(`/movies/${id}`);

      console.log("✅ Movie deleted:", id);
    } catch (error) {
      console.error("❌ Delete movie error:", error);
      console.error("Response:", error.response?.data);
      throw error;
    }
  },
};

export default movieService;
