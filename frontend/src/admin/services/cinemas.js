// frontend/src/admin/services/cinemas.js
import axiosInstance from "../../services/axiosInstance";
import { API_ENDPOINTS } from "../../config/api";

/**
 * Get all cinemas
 */
export const getCinemas = async (params = {}) => {
  try {
    // Backend endpoint: GET /cinemas
    const cinemas = await axiosInstance.get(API_ENDPOINTS.CINEMAS, { params });
    return { cinemas: Array.isArray(cinemas) ? cinemas : [] };
  } catch (error) {
    console.error("Get cinemas error:", error);
    throw error;
  }
};

/**
 * Get cinema by ID
 */
export const getCinemaById = async (id) => {
  try {
    // Backend endpoint: GET /cinemas/{cinemaId}
    const cinema = await axiosInstance.get(API_ENDPOINTS.CINEMA_BY_ID(id));
    return cinema;
  } catch (error) {
    console.error("Get cinema error:", error);
    throw error;
  }
};

/**
 * Create cinema
 */
export const createCinema = async (cinemaData) => {
  try {
    // Backend endpoint: POST /cinemas
    // Body theo CinemaCreationRequest
    const payload = {
      name: cinemaData.name,
      address: cinemaData.address,
      hotline: cinemaData.hotline,
      image: cinemaData.image,
    };

    const cinema = await axiosInstance.post(API_ENDPOINTS.CINEMAS, payload);
    return cinema;
  } catch (error) {
    console.error("Create cinema error:", error);
    throw error;
  }
};

/**
 * Update cinema
 */
export const updateCinema = async (id, cinemaData) => {
  try {
    // Backend endpoint: PUT /cinemas/{cinemaId}
    const payload = {
      name: cinemaData.name,
      address: cinemaData.address,
      hotline: cinemaData.hotline,
      image: cinemaData.image,
    };

    const cinema = await axiosInstance.put(
      API_ENDPOINTS.CINEMA_BY_ID(id),
      payload
    );
    return cinema;
  } catch (error) {
    console.error("Update cinema error:", error);
    throw error;
  }
};

/**
 * Delete cinema
 */
export const deleteCinema = async (id) => {
  try {
    // Backend endpoint: DELETE /cinemas/{cinemaId}
    await axiosInstance.delete(API_ENDPOINTS.CINEMA_BY_ID(id));
  } catch (error) {
    console.error("Delete cinema error:", error);
    throw error;
  }
};

/**
 * Get cinema stats (if needed)
 * Backend chưa có endpoint này, có thể bỏ hoặc tự tính
 */
export const getCinemaStats = async (id) => {
  try {
    // TODO: Backend chưa có endpoint stats
    // Tạm thời trả về mock data hoặc tính từ client
    const rooms = await axiosInstance.get(
      `${API_ENDPOINTS.ROOMS}?cinemaId=${id}`
    );
    const showtimes = await axiosInstance.get(
      `${API_ENDPOINTS.SHOWTIMES}?cinemaId=${id}`
    );

    return {
      totalRooms: rooms.length,
      totalShowtimes: showtimes.length,
    };
  } catch (error) {
    console.error("Get cinema stats error:", error);
    return { totalRooms: 0, totalShowtimes: 0 };
  }
};
