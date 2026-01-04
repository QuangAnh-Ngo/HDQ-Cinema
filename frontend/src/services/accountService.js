// frontend/src/services/accountService.js
import axiosInstance from "./axiosInstance";

export const accountService = {
  /**
   * Lấy danh sách tất cả tài khoản nhân viên (GET /accounts)
   * @returns {Promise<Array>}
   */
  getAll: async () => {
    try {
      const response = await axiosInstance.get("/accounts");
      // Response: Array of { employeeAccountId, username, email, roles }
      return response || [];
    } catch (error) {
      console.error("Get accounts error:", error);
      throw error;
    }
  },

  /**
   * Lấy thông tin tài khoản đang đăng nhập (GET /accounts/my-info)
   * @returns {Promise<Object>}
   */
  getMyInfo: async () => {
    try {
      const response = await axiosInstance.get("/accounts/my-info");
      // Response: { employeeAccountId, username, email, roles: [{ id, name, description, permissions }] }
      return response;
    } catch (error) {
      console.error("Get my account info error:", error);
      throw error;
    }
  },

  /**
   * Tạo tài khoản nhân viên mới (POST /accounts)
   * @param {Object} data - { username, password, email, roles, employee }
   * @returns {Promise<Object>}
   */
  create: async (data) => {
    try {
      const payload = {
        username: data.username,
        password: data.password,
        email: data.email,
        roles: data.roles || [], // Array of role names (strings)
        employee: data.employee, // Employee ID
      };

      const response = await axiosInstance.post("/accounts", payload);
      return response;
    } catch (error) {
      console.error("Create account error:", error);
      throw error;
    }
  },

  /**
   * Cập nhật tài khoản (PUT /accounts/{employeeAccountId})
   * @param {string} id - Employee Account ID
   * @param {Object} data - { password, roles, employee }
   * @returns {Promise<Object>}
   */
  update: async (id, data) => {
    try {
      const payload = {
        password: data.password,
        roles: data.roles || [],
        employee: data.employee,
      };

      const response = await axiosInstance.put(`/accounts/${id}`, payload);
      return response;
    } catch (error) {
      console.error("Update account error:", error);
      throw error;
    }
  },

  /**
   * Xóa tài khoản (DELETE /accounts/{employeeAccountId})
   * @param {string} id - Employee Account ID
   * @returns {Promise<void>}
   */
  delete: async (id) => {
    try {
      await axiosInstance.delete(`/accounts/${id}`);
    } catch (error) {
      console.error("Delete account error:", error);
      throw error;
    }
  },
};

export default accountService;
