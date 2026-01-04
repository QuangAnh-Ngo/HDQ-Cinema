// frontend/src/services/roleService.js
import axiosInstance from "./axiosInstance";

export const roleService = {
  /**
   * Lấy danh sách tất cả roles (GET /roles)
   * @returns {Promise<Array>}
   */
  getAll: async () => {
    try {
      const response = await axiosInstance.get("/roles");
      return response || [];
    } catch (error) {
      console.error("Get roles error:", error);
      throw error;
    }
  },

  /**
   * Lấy chi tiết role theo ID (GET /roles/{roleId})
   * @param {string} id - Role ID
   * @returns {Promise<Object>}
   */
  getById: async (id) => {
    try {
      const response = await axiosInstance.get(`/roles/${id}`);
      return response;
    } catch (error) {
      console.error("Get role by ID error:", error);
      throw error;
    }
  },

  /**
   * Tạo role mới (POST /roles)
   * @param {Object} data - { name, description, permissions }
   * @returns {Promise<Object>}
   */
  create: async (data) => {
    try {
      const payload = {
        name: data.name,
        description: data.description,
        permissions: data.permissions || [], // Array of permission names
      };

      const response = await axiosInstance.post("/roles", payload);
      return response;
    } catch (error) {
      console.error("Create role error:", error);
      throw error;
    }
  },

  /**
   * Cập nhật role (PUT /roles/{roleId})
   * @param {string} id - Role ID
   * @param {Object} data - { name, description, permissions }
   * @returns {Promise<Object>}
   */
  update: async (id, data) => {
    try {
      const payload = {
        name: data.name,
        description: data.description,
        permissions: data.permissions || [],
      };

      const response = await axiosInstance.put(`/roles/${id}`, payload);
      return response;
    } catch (error) {
      console.error("Update role error:", error);
      throw error;
    }
  },

  /**
   * Xóa role (DELETE /roles/{roleId})
   * @param {string} id - Role ID
   * @returns {Promise<void>}
   */
  delete: async (id) => {
    try {
      await axiosInstance.delete(`/roles/${id}`);
    } catch (error) {
      console.error("Delete role error:", error);
      throw error;
    }
  },
};

export default roleService;
