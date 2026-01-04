// frontend/src/services/roomService.js
import axiosInstance from "./axiosInstance";

export const roomService = {
  /**
   * Lấy danh sách tất cả phòng (GET /rooms)
   * @returns {Promise<Array>}
   */
  getAll: async () => {
    try {
      const response = await axiosInstance.get("/rooms");
      return response || [];
    } catch (error) {
      console.error("Get all rooms error:", error);
      throw error;
    }
  },

  /**
   * Lấy chi tiết phòng theo ID (GET /rooms/{roomId})
   * @param {string} id - Room ID
   * @returns {Promise<Object>}
   */
  getById: async (id) => {
    try {
      const response = await axiosInstance.get(`/rooms/${id}`);
      return response;
    } catch (error) {
      console.error("Get room by ID error:", error);
      throw error;
    }
  },

  /**
   * Tạo phòng chiếu mới (POST /rooms)
   * @param {Object} data - { roomName, cinemaId }
   * @returns {Promise<Object>}
   */
  create: async (data) => {
    try {
      const payload = {
        roomName: data.roomName,
        cinemaId: data.cinemaId,
      };
      const response = await axiosInstance.post("/rooms", payload);
      return response;
    } catch (error) {
      console.error("Create room error:", error);
      throw error;
    }
  },

  /**
   * Cập nhật phòng (PUT /rooms/{roomId})
   * @param {string} id - Room ID
   * @param {Object} data - { roomName, cinemaId }
   * @returns {Promise<Object>}
   */
  update: async (id, data) => {
    try {
      const payload = {
        roomName: data.roomName,
        cinemaId: data.cinemaId,
      };
      const response = await axiosInstance.put(`/rooms/${id}`, payload);
      return response;
    } catch (error) {
      console.error("Update room error:", error);
      throw error;
    }
  },

  /**
   * Xóa phòng (DELETE /rooms/{roomId})
   * @param {string} id - Room ID
   * @returns {Promise<void>}
   */
  delete: async (id) => {
    try {
      await axiosInstance.delete(`/rooms/${id}`);
    } catch (error) {
      console.error("Delete room error:", error);
      throw error;
    }
  },

  /**
   * Lấy danh sách phòng theo rạp (Utility - dùng cinema endpoint)
   * @param {string} cinemaId - Cinema ID
   * @returns {Promise<Array>}
   */
  getByCinema: async (cinemaId) => {
    try {
      // Lấy từ theater endpoint vì nó trả về rooms
      const cinema = await axiosInstance.get(`/theaters/${cinemaId}`);
      return cinema.rooms || [];
    } catch (error) {
      console.error("Get rooms by cinema error:", error);
      return [];
    }
  },
};

export default roomService;
