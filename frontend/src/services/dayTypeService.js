// frontend/src/services/dayTypeService.js
import axiosInstance from "./axiosInstance";

export const dayTypeService = {
  /**
   * Tạo loại ngày áp dụng giá vé mới (POST /daytypes)
   * @param {Object} data - { dayType, dayStart, dayEnd }
   * @returns {Promise<Object>}
   */
  create: async (data) => {
    try {
      const payload = {
        dayType: data.dayType, // VD: "HOLIDAY", "SPECIAL_EVENT"
        dayStart: data.dayStart, // Format: "YYYY-MM-DD"
        dayEnd: data.dayEnd, // Format: "YYYY-MM-DD"
      };

      const response = await axiosInstance.post("/daytypes", payload);
      return response;
    } catch (error) {
      console.error("Create day type error:", error);
      throw error;
    }
  },
};

export default dayTypeService;
