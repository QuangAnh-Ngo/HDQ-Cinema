import adminApi from "./adminApi";
import {
  adaptMoviesFromDB,
  adaptMovieFromDB,
  adaptMovieForDB,
} from "../utils/dataAdapters";

export const getMovies = async (params = {}) => {
  try {
    const response = await adminApi.get("/movies", { params });
    const movies = response.data.movies || response.data;
    return { movies: adaptMoviesFromDB(movies) };
  } catch (error) {
    throw error.response?.data || { message: "Lỗi khi tải danh sách phim" };
  }
};

export const getMovieById = async (id) => {
  try {
    const response = await adminApi.get(`/movies/${id}`);
    return adaptMovieFromDB(response.data);
  } catch (error) {
    throw error.response?.data || { message: "Lỗi khi tải thông tin phim" };
  }
};

export const createMovie = async (movieData) => {
  try {
    // Generate new ID
    const allMovies = await getMovies();
    const newId = Math.max(...allMovies.movies.map((m) => m.id), 0) + 1;

    const dataToSend = adaptMovieForDB({
      ...movieData,
      id: newId,
      createdAt: new Date().toISOString(),
    });

    const response = await adminApi.post("/movies", dataToSend);
    return adaptMovieFromDB(response.data);
  } catch (error) {
    throw error.response?.data || { message: "Lỗi khi tạo phim mới" };
  }
};

export const updateMovie = async (id, movieData) => {
  try {
    const dataToSend = adaptMovieForDB({
      ...movieData,
      id,
      updatedAt: new Date().toISOString(),
    });

    const response = await adminApi.put(`/movies/${id}`, dataToSend);
    return adaptMovieFromDB(response.data);
  } catch (error) {
    throw error.response?.data || { message: "Lỗi khi cập nhật phim" };
  }
};

export const deleteMovie = async (id) => {
  try {
    const response = await adminApi.delete(`/movies/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Lỗi khi xóa phim" };
  }
};

export const uploadPoster = async (file) => {
  try {
    const formData = new FormData();
    formData.append("poster", file);
    const response = await adminApi.post("/movies/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Lỗi khi upload poster" };
  }
};
