// frontend/src/services/employeeService.js
import axiosInstance from "./axiosInstance";

export const employeeService = {
  /**
   * Lấy danh sách nhân viên (GET /employees)
   * @returns {Promise<Array>}
   */
  getAll: async () => {
    try {
      const response = await axiosInstance.get("/employees");
      // Response: Array of { position, firstName, lastName, phone, email }
      return response || [];
    } catch (error) {
      console.error("Get employees error:", error);
      throw error;
    }
  },

  /**
   * Tạo nhân viên mới (POST /employees)
   * @param {Object} data - { firstName, lastName, phone, email }
   * @returns {Promise<Object>}
   */
  create: async (data) => {
    try {
      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || data.phoneNumber,
        email: data.email,
      };

      const response = await axiosInstance.post("/employees", payload);
      // Response: { position, firstName, lastName, phone, email }
      return response;
    } catch (error) {
      console.error("Create employee error:", error);
      throw error;
    }
  },

  /**
   * Cập nhật thông tin nhân viên (PUT /employees/{employeeAccountId})
   * @param {string} id - Employee Account ID
   * @param {Object} data - { firstName, lastName, phone, email }
   * @returns {Promise<Object>}
   */
  update: async (id, data) => {
    try {
      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || data.phoneNumber,
        email: data.email,
      };

      const response = await axiosInstance.put(`/employees/${id}`, payload);
      return response;
    } catch (error) {
      console.error("Update employee error:", error);
      throw error;
    }
  },

  /**
   * Xóa nhân viên (DELETE /employees/{employeeId})
   * @param {string} id - Employee ID
   * @returns {Promise<void>}
   */
  delete: async (id) => {
    try {
      await axiosInstance.delete(`/employees/${id}`);
    } catch (error) {
      console.error("Delete employee error:", error);
      throw error;
    }
  },
};

export default employeeService;
