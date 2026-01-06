// frontend/src/services/permissionService.js
import axiosInstance from "./axiosInstance";

export const permissionService = {
  /**
   * Lấy danh sách tất cả permissions (GET /permissions)
   * @returns {Promise<Array>}
   */
  getAll: async () => {
    try {
      const response = await axiosInstance.get("/permissions");
      return response || [];
    } catch (error) {
      console.error("Get permissions error:", error);
      throw error;
    }
  },

  /**
   * Lấy chi tiết permission theo ID (GET /permissions/{permissionId})
   * @param {string} id - Permission ID
   * @returns {Promise<Object>}
   */
  getById: async (id) => {
    try {
      const response = await axiosInstance.get(`/permissions/${id}`);
      return response;
    } catch (error) {
      console.error("Get permission by ID error:", error);
      throw error;
    }
  },

  /**
   * Tạo permission mới (POST /permissions)
   * @param {Object} data - { name, description }
   * @returns {Promise<Object>}
   */
  create: async (data) => {
    try {
      const payload = {
        name: data.name,
        description: data.description,
      };

      const response = await axiosInstance.post("/permissions", payload);
      return response;
    } catch (error) {
      console.error("Create permission error:", error);
      throw error;
    }
  },

  /**
   * Cập nhật permission (PUT /permissions/{permissionId})
   * @param {string} id - Permission ID
   * @param {Object} data - { name, description }
   * @returns {Promise<Object>}
   */
  update: async (id, data) => {
    try {
      const payload = {
        name: data.name,
        description: data.description,
      };

      const response = await axiosInstance.put(`/permissions/${id}`, payload);
      return response;
    } catch (error) {
      console.error("Update permission error:", error);
      throw error;
    }
  },

  /**
   * Xóa permission (DELETE /permissions/{permissionId})
   * @param {string} id - Permission ID
   * @returns {Promise<void>}
   */
  delete: async (id) => {
    try {
      await axiosInstance.delete(`/permissions/${id}`);
    } catch (error) {
      console.error("Delete permission error:", error);
      throw error;
    }
  },
};

export default permissionService;
