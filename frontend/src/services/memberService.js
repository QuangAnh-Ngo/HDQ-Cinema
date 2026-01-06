// frontend/src/services/memberService.js
import axiosInstance from "./axiosInstance";

export const memberService = {
  /**
   * Get all members (GET /members)
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
   * Register new member (POST /members)
   */
  create: async (data) => {
    try {
      const payload = {
        username: data.username,
        password: data.password, // Min 8 chars
        email: data.email,
        phoneNumber: data.phoneNumber || data.phone, // Min 10 chars
        firstName: data.firstName,
        lastName: data.lastName,
        dob: data.dob, // Format: "YYYY-MM-DD"
      };

      console.log("📤 Creating member:", payload);
      const response = await axiosInstance.post("/members", payload);
      console.log("✅ Member created:", response);

      return response;
    } catch (error) {
      console.error("❌ Create member error:", error);
      console.error("Response:", error.response?.data);
      throw error;
    }
  },

  /**
   * Update member (PUT /members/{memberId})
   * Note: API uses {employeeAccountId} in path but this is for members
   */
  update: async (memberId, data) => {
    try {
      const payload = {
        username: data.username,
        email: data.email,
        phoneNumber: data.phoneNumber || data.phone,
        dob: data.dob,
      };

      // Only include password if provided
      if (data.password && data.password.trim()) {
        payload.password = data.password;
      }

      console.log("📤 Updating member:", memberId, payload);
      const response = await axiosInstance.put(`/members/${memberId}`, payload);
      console.log("✅ Member updated:", response);

      return response;
    } catch (error) {
      console.error("❌ Update member error:", error);
      console.error("Response:", error.response?.data);
      throw error;
    }
  },

  /**
   * Delete member (DELETE /members/{memberId})
   */
  delete: async (memberId) => {
    try {
      console.log("📤 Deleting member:", memberId);
      await axiosInstance.delete(`/members/${memberId}`);
      console.log("✅ Member deleted:", memberId);
    } catch (error) {
      console.error("❌ Delete member error:", error);
      console.error("Response:", error.response?.data);
      throw error;
    }
  },

  /**
   * Search members by keyword
   */
  search: async (keyword) => {
    try {
      const allMembers = await memberService.getAll();
      const lowerKeyword = keyword.toLowerCase();

      return allMembers.filter(
        (member) =>
          member.username?.toLowerCase().includes(lowerKeyword) ||
          member.email?.toLowerCase().includes(lowerKeyword) ||
          member.phoneNumber?.includes(keyword) ||
          member.firstName?.toLowerCase().includes(lowerKeyword) ||
          member.lastName?.toLowerCase().includes(lowerKeyword)
      );
    } catch (error) {
      console.error("Search members error:", error);
      throw error;
    }
  },
};

export default memberService;
