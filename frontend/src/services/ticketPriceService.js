// frontend/src/services/ticketPriceService.js
import axiosInstance from "./axiosInstance";

export const ticketPriceService = {
  /**
   * Tạo/Thiết lập giá vé mới (POST /tickets)
   * @param {Object} data - { price, cinemaId, dayType, seatType }
   * @returns {Promise<Object>}
   */
  create: async (data) => {
    try {
      const payload = {
        price: parseFloat(data.price),
        cinemaId: data.cinemaId,
        dayType: data.dayType, // VD: "WEEKDAY", "WEEKEND", "HOLIDAY"
        seatType: data.seatType, // VD: "STANDARD", "VIP", "COUPLE"
      };

      const response = await axiosInstance.post("/tickets", payload);
      return response;
    } catch (error) {
      console.error("Create ticket price error:", error);
      throw error;
    }
  },
};

export default ticketPriceService;
