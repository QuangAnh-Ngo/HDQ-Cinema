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
    // 1. Lấy tất cả cinemas
    const cinemas = await cinemaService.getAll(); // [cinema1, cinema2, ...]

    // 2. Loop qua từng cinema
    const allMoviesPromises = cinemas.map(async (cinema) => {
      const [showing, upcoming] = await Promise.all([
        movieService.getShowing(cinema.id), // ?c=01
        movieService.getUpcoming(cinema.id), // ?c=01
      ]);
      return [...showing, ...upcoming];
    });

    // 3. Merge tất cả
    const moviesArrays = await Promise.all(allMoviesPromises);
    const allMovies = moviesArrays.flat(); // [movie1, movie2, movie1, movie3, ...]

    // 4. Remove duplicates
    const uniqueMovies = Array.from(
      new Map(allMovies.map((m) => [m.id, m])).values()
    );

    return uniqueMovies;
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
        limitAge: parseInt(data.limitAge, 10),
        dayStart: data.dayStart,
        dayEnd: data.dayEnd,
        director: data.director,
        genre: data.genre,
        description: data.description,
        trailer_url: data.trailer_url,
      };

      const response = await axiosInstance.post("/movies", payload);
      return response;
    } catch (error) {
      console.error("Create movie error:", error);
      throw error;
    }
  },

  /**
   * Cập nhật phim (PUT /movies/{id})
   * @param {string} id - Movie ID
   * @param {Object} data - Dữ liệu phim cần update
   * @returns {Promise<Object>} Object phim đã update
   */
  update: async (id, data) => {
    try {
      const payload = {
        title: data.title,
        poster: data.poster,
        duration: parseInt(data.duration, 10),
        limitAge: parseInt(data.limitAge, 10),
        dayStart: data.dayStart,
        dayEnd: data.dayEnd,
        director: data.director,
        genre: data.genre,
        description: data.description,
        trailer_url: data.trailer_url,
      };

      const response = await axiosInstance.put(`/movies/${id}`, payload);
      return response;
    } catch (error) {
      console.error("Update movie error:", error);
      throw error;
    }
  },

  /**
   * Xóa phim (DELETE /movies/{id})
   * @param {string} id - Movie ID
   * @returns {Promise<void>}
   */
  delete: async (id) => {
    try {
      await axiosInstance.delete(`/movies/${id}`);
    } catch (error) {
      console.error("Delete movie error:", error);
      throw error;
    }
  },
};

export default movieService;
