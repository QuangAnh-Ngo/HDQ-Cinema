// frontend/src/admin/services/movies.js
// Simple wrapper - Re-export from main service
import { movieService } from "../../services";

/**
 * Get all movies
 * @param {Object} params - Query parameters (optional)
 * @returns {Promise<{movies: Array}>}
 */
export const getMovies = async (params = {}) => {
  try {
    // Backend endpoint: GET /movies
    // Response: { code: 1000, message: "Success", result: [...] }
    const movies = await axiosInstance.get(API_ENDPOINTS.MOVIES, { params });

    // axiosInstance đã extract result, nên movies là array
    return { movies: Array.isArray(movies) ? movies : [] };
  } catch (error) {
    console.error("Get movies error:", error);
    throw error;
  }
};

/**
 * Get movie by ID
 * @param {number|string} id - Movie ID
 * @returns {Promise<Object>}
 */
export const getMovieById = async (id) => {
  try {
    // Backend endpoint: GET /movies/{movieId}
    const movie = await axiosInstance.get(API_ENDPOINTS.MOVIE_BY_ID(id));
    return movie;
  } catch (error) {
    console.error("Get movie error:", error);
    throw error;
  }
};

/**
 * Create new movie
 * @param {Object} movieData - Movie data
 * @returns {Promise<Object>}
 */
export const createMovie = async (movieData) => {
  try {
    // Backend endpoint: POST /movies
    // Body theo MovieCreationRequest từ backend
    const payload = {
      title: movieData.title,
      description: movieData.description,
      director: movieData.director,
      actors: movieData.actors,
      genre: movieData.genre,
      duration: parseInt(movieData.duration), // Backend yêu cầu integer
      releaseDate: movieData.releaseDate, // Format: YYYY-MM-DD
      posterUrl: movieData.posterUrl || movieData.poster_url,
      trailerUrl: movieData.trailerUrl || movieData.trailer_url,
      rating: parseFloat(movieData.rating || 0),
      language: movieData.language,
      ageRating: movieData.ageRating || movieData.age_rating,
    };

    const movie = await axiosInstance.post(API_ENDPOINTS.MOVIES, payload);
    return movie;
  } catch (error) {
    console.error("Create movie error:", error);
    throw error;
  }
};

/**
 * Update movie
 * @param {number|string} id - Movie ID
 * @param {Object} movieData - Movie data to update
 * @returns {Promise<Object>}
 */
export const updateMovie = async (id, movieData) => {
  try {
    // Backend endpoint: PUT /movies/{movieId}
    const payload = {
      title: movieData.title,
      description: movieData.description,
      director: movieData.director,
      actors: movieData.actors,
      genre: movieData.genre,
      duration: parseInt(movieData.duration),
      releaseDate: movieData.releaseDate,
      posterUrl: movieData.posterUrl || movieData.poster_url,
      trailerUrl: movieData.trailerUrl || movieData.trailer_url,
      rating: parseFloat(movieData.rating || 0),
      language: movieData.language,
      ageRating: movieData.ageRating || movieData.age_rating,
    };

    const movie = await axiosInstance.put(
      API_ENDPOINTS.MOVIE_BY_ID(id),
      payload
    );
    return movie;
  } catch (error) {
    console.error("Update movie error:", error);
    throw error;
  }
};

/**
 * Delete movie
 * @param {number|string} id - Movie ID
 * @returns {Promise<void>}
 */
export const deleteMovie = async (id) => {
  try {
    // Backend endpoint: DELETE /movies/{movieId}
    await axiosInstance.delete(API_ENDPOINTS.MOVIE_BY_ID(id));
  } catch (error) {
    console.error("Delete movie error:", error);
    throw error;
  }
};

/**
 * Upload poster (nếu backend support)
 * Hiện tại backend chưa có endpoint upload file
 * Cần confirm với backend team
 */
export const uploadPoster = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    // TODO: Xác nhận endpoint với backend
    const response = await axiosInstance.post(
      "/movies/upload-poster",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    return response;
  } catch (error) {
    console.error("Upload poster error:", error);
    throw error;
  }
};
