// frontend/src/services/memberService.js
import axiosInstance from "./axiosInstance";

export const memberService = {
  /**
   * Lấy danh sách tất cả thành viên (GET /members)
   * @returns {Promise<Array>}
   */
  getAll: async () => {
    try {
      const response = await axiosInstance.get("/members");
      return response || [];
    } catch (error) {
      console.error("Get members error:", error);
      throw error;
    }
  },

  /**
   * Lấy thông tin thành viên đang đăng nhập (GET /members/my-info)
   * @returns {Promise<Object>}
   */
  getMyInfo: async () => {
    try {
      const response = await axiosInstance.get("/members/my-info");
      // Response: { username, email, phoneNumber, firstName, lastName, dob, roles }
      return response;
    } catch (error) {
      console.error("Get current member info error:", error);
      throw error;
    }
  },

  /**
   * Đăng ký thành viên mới (POST /members)
   * @param {Object} data - { username, password, email, phoneNumber, firstName, lastName, dob }
   * @returns {Promise<Object>}
   */
  register: async (data) => {
    try {
      const payload = {
        username: data.username,
        password: data.password,
        email: data.email,
        phoneNumber: data.phoneNumber || data.phone,
        firstName: data.firstName,
        lastName: data.lastName,
        dob: data.dob, // Format: "YYYY-MM-DD"
      };

      const response = await axiosInstance.post("/members", payload);
      return response;
    } catch (error) {
      console.error("Register member error:", error);
      throw error;
    }
  },

  /**
   * Cập nhật thông tin thành viên (PUT /members/{employeeAccountId})
   * ⚠️ Lưu ý: Swagger dùng path param {employeeAccountId} nhưng đây là member update
   * @param {string} id - Member ID
   * @param {Object} data - { username, password, email, phoneNumber, dob }
   * @returns {Promise<Object>}
   */
  update: async (id, data) => {
    try {
      const payload = {
        username: data.username,
        password: data.password,
        email: data.email,
        phoneNumber: data.phoneNumber || data.phone,
        dob: data.dob,
      };

      const response = await axiosInstance.put(`/members/${id}`, payload);
      return response;
    } catch (error) {
      console.error("Update member error:", error);
      throw error;
    }
  },

  /**
   * Xóa thành viên (DELETE /members/{employeeId})
   * @param {string} id - Member ID
   * @returns {Promise<void>}
   */
  delete: async (id) => {
    try {
      await axiosInstance.delete(`/members/${id}`);
    } catch (error) {
      console.error("Delete member error:", error);
      throw error;
    }
  },
};

export default memberService;
