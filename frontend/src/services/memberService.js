// frontend/src/services/memberService.js
import axiosInstance from "./axiosInstance";

export const memberService = {
  /**
   * Get all members (GET /members)
   */
  getAll: async () => {
    try {
      const response = await axiosInstance.get("/members");
      return response?.result || response?.data?.result || [];
    } catch (error) {
      console.error("Get members error:", error);
      throw error;
    }
  },

  /**
   * Get current logged-in member info (GET /members/my-info)
   */
  getMyInfo: async () => {
    try {
      const response = await axiosInstance.get("/members/my-info");
      return response;
    } catch (error) {
      console.error("Get current member info error:", error);
      throw error;
    }
  },

  /**
   * ✅ Register new member (POST /members)
   * Used by Register page
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
        dob: data.dob, // ✅ MUST be YYYY-MM-DD format
      };

      console.log("📤 Register payload:", payload);

      const response = await axiosInstance.post("/members", payload);

      console.log("✅ Register response:", response);

      return response;
    } catch (error) {
      console.error("❌ Register error:", error);
      throw error;
    }
  },

  /**
   * Create member (alias for register - used by admin)
   */
  create: async (data) => {
    return memberService.register(data);
  },

  /**
   * Update member (PUT /members/{memberId})
   */
  update: async (memberId, data) => {
    try {
      const payload = {
        username: data.username,
        email: data.email,
        phoneNumber: data.phoneNumber || data.phone,
        dob: data.dob,
      };

      if (data.password && data.password.trim()) {
        payload.password = data.password;
      }

      const response = await axiosInstance.put(`/members/${memberId}`, payload);
      return response;
    } catch (error) {
      console.error("Update member error:", error);
      throw error;
    }
  },

  /**
   * Delete member (DELETE /members/{memberId})
   */
  delete: async (memberId) => {
    try {
      await axiosInstance.delete(`/members/${memberId}`);
    } catch (error) {
      console.error("Delete member error:", error);
      throw error;
    }
  },
};

export default memberService;
