import adminApi from "./adminApi";
import {
  adaptCinemasFromDB,
  adaptCinemaFromDB,
  adaptCinemaForDB,
} from "../utils/dataAdapters";

export const getCinemas = async (params = {}) => {
  try {
    const response = await adminApi.get("/cinemas", { params });
    const cinemas = response.data.cinemas || response.data;
    return { cinemas: adaptCinemasFromDB(cinemas) };
  } catch (error) {
    throw error.response?.data || { message: "Lỗi khi tải danh sách rạp" };
  }
};

export const getCinemaById = async (id) => {
  try {
    const response = await adminApi.get(`/cinemas/${id}`);
    return adaptCinemaFromDB(response.data);
  } catch (error) {
    throw error.response?.data || { message: "Lỗi khi tải thông tin rạp" };
  }
};

export const createCinema = async (cinemaData) => {
  try {
    const allCinemas = await getCinemas();
    const newId = Math.max(...allCinemas.cinemas.map((c) => c.id), 0) + 1;

    const dataToSend = adaptCinemaForDB({
      ...cinemaData,
      id: newId,
      createdAt: new Date().toISOString(),
    });

    const response = await adminApi.post("/cinemas", dataToSend);
    return adaptCinemaFromDB(response.data);
  } catch (error) {
    throw error.response?.data || { message: "Lỗi khi tạo rạp mới" };
  }
};

export const updateCinema = async (id, cinemaData) => {
  try {
    const dataToSend = adaptCinemaForDB({
      ...cinemaData,
      id,
      updatedAt: new Date().toISOString(),
    });

    const response = await adminApi.put(`/cinemas/${id}`, dataToSend);
    return adaptCinemaFromDB(response.data);
  } catch (error) {
    throw error.response?.data || { message: "Lỗi khi cập nhật rạp" };
  }
};

export const deleteCinema = async (id) => {
  try {
    const response = await adminApi.delete(`/cinemas/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Lỗi khi xóa rạp" };
  }
};

export const getCinemaStats = async (id) => {
  try {
    const response = await adminApi.get(`/cinemas/${id}/stats`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Lỗi khi tải thống kê" };
  }
};
