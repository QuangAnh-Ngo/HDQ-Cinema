// frontend/src/services/cinemaService.js
import axiosInstance from "./axiosInstance";

export const cinemaService = {
  /**
   * Lấy danh sách tất cả rạp chiếu (GET /theaters)
   * @returns {Promise<Array>}
   */
  getAll: async () => {
    try {
      const response = await axiosInstance.get("/theaters");
      return response || [];
    } catch (error) {
      console.error("Get cinemas error:", error);
      throw error;
    }
  },

  /**
   * Lấy chi tiết rạp chiếu theo ID (GET /theaters/{cinemaId})
   * @param {string} id - Cinema ID
   * @returns {Promise<Object>}
   */
  getById: async (id) => {
    try {
      const response = await axiosInstance.get(`/theaters/${id}`);
      return response;
    } catch (error) {
      console.error("Get cinema error:", error);
      throw error;
    }
  },

  /**
   * Tạo rạp chiếu mới (POST /theaters)
   * @param {Object} data - { name, city, district, address }
   * @returns {Promise<Object>}
   */
  create: async (data) => {
    try {
      const payload = {
        name: data.name,
        city: data.city,
        district: data.district,
        address: data.address,
      };
      const response = await axiosInstance.post("/theaters", payload);
      return response;
    } catch (error) {
      console.error("Create cinema error:", error);
      throw error;
    }
  },

  /**
   * Cập nhật rạp chiếu (PUT /theaters/{cinemaId})
   * @param {string} id - Cinema ID
   * @param {Object} data - { name, city, district, address }
   * @returns {Promise<Object>}
   */
  update: async (id, data) => {
    try {
      const payload = {
        name: data.name,
        city: data.city,
        district: data.district,
        address: data.address,
      };
      const response = await axiosInstance.put(`/theaters/${id}`, payload);
      return response;
    } catch (error) {
      console.error("Update cinema error:", error);
      throw error;
    }
  },

  /**
   * Xóa rạp chiếu (DELETE /theaters/{cinemaId})
   * @param {string} id - Cinema ID
   * @returns {Promise<void>}
   */
  delete: async (id) => {
    try {
      await axiosInstance.delete(`/theaters/${id}`);
    } catch (error) {
      console.error("Delete cinema error:", error);
      throw error;
    }
  },

  /**
   * Lấy thống kê số phòng của rạp
   * @param {string} id - Cinema ID
   * @returns {Promise<Object>}
   */
  getStats: async (id) => {
    try {
      const cinema = await cinemaService.getById(id);
      return {
        totalRooms: cinema.rooms?.length || 0,
      };
    } catch (error) {
      console.error("Get cinema stats error:", error);
      return { totalRooms: 0 };
    }
  },

  /**
   * Thêm phòng chiếu mới (POST /rooms)
   * @param {Object} data - { roomName, cinemaId }
   * @returns {Promise<Object>}
   */
  addRoom: async (data) => {
    try {
      const payload = {
        roomName: data.roomName,
        cinemaId: data.cinemaId,
      };
      const response = await axiosInstance.post("/rooms", payload);
      return response;
    } catch (error) {
      console.error("Add room error:", error);
      throw error;
    }
  },
};

export default cinemaService;
