// frontend/src/services/ticketPriceService.js
import axiosInstance from "./axiosInstance";

export const ticketPriceService = {
  /**
   * ✅ Lấy tất cả giá vé
   * GET /tickets
   */
  getAll: async () => {
    try {
      const response = await axiosInstance.get("/tickets");
      return response || [];
    } catch (error) {
      console.error("Get all ticket prices error:", error);
      throw error;
    }
  },

  /**
   * ✅ Lấy giá vé theo ID
   * GET /tickets/{ticketPriceId}
   */
  getById: async (id) => {
    try {
      const response = await axiosInstance.get(`/tickets/${id}`);
      return response;
    } catch (error) {
      console.error("Get ticket price by ID error:", error);
      throw error;
    }
  },

  /**
   * ✅ Tạo giá vé mới
   * POST /tickets
   * Request: { price, cinemaId, dayType, seatType }
   */
  create: async (data) => {
    try {
      const payload = {
        price: parseFloat(data.price),
        cinemaId: data.cinemaId,
        dayType: data.dayType, // "WEEKDAY", "WEEKEND", "HOLIDAY"
        seatType: data.seatType, // "CLASSIC", "VIP"
      };

      console.log("💰 Creating ticket price:", payload);

      const response = await axiosInstance.post("/tickets", payload);
      return response;
    } catch (error) {
      console.error("Create ticket price error:", error);
      throw error;
    }
  },

  /**
   * ✅ Cập nhật giá vé
   * PUT /tickets/{ticketPriceId}
   */
  update: async (id, data) => {
    try {
      const payload = {
        price: parseFloat(data.price),
        cinemaId: data.cinemaId,
        dayType: data.dayType,
        seatType: data.seatType,
      };

      const response = await axiosInstance.put(`/tickets/${id}`, payload);
      return response;
    } catch (error) {
      console.error("Update ticket price error:", error);
      throw error;
    }
  },

  /**
   * ✅ Xóa giá vé
   * DELETE /tickets/{ticketPriceId}
   */
  delete: async (id) => {
    try {
      const response = await axiosInstance.delete(`/tickets/${id}`);
      return response;
    } catch (error) {
      console.error("Delete ticket price error:", error);
      throw error;
    }
  },

  /**
   * ✅ Utility: Tính giá vé dựa trên seat type và day type
   * @param {Array} prices - Danh sách giá vé từ getAll()
   * @param {string} cinemaId - Cinema ID
   * @param {string} seatType - "CLASSIC" hoặc "VIP"
   * @param {Date} date - Ngày chiếu
   * @returns {number} Giá vé
   */
  calculatePrice: (prices, cinemaId, seatType, date) => {
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
    const dayType = dayOfWeek === 0 || dayOfWeek === 6 ? "WEEKEND" : "WEEKDAY";

    // Find matching price
    const priceObj = prices.find(
      (p) =>
        p.cinemaId === cinemaId &&
        p.seatType === seatType &&
        p.dayType === dayType
    );

    return priceObj?.price || 0;
  },

  /**
   * ✅ Utility: Format giá vé cho UI
   */
  formatPrice: (price) => {
    return new Intl.NumberFormat("vi-VN").format(price) + "đ";
  },

  /**
   * ✅ Utility: Nhóm giá vé theo cinema
   */
  groupByCinema: (prices) => {
    return prices.reduce((acc, price) => {
      if (!acc[price.cinemaId]) {
        acc[price.cinemaId] = [];
      }
      acc[price.cinemaId].push(price);
      return acc;
    }, {});
  },

  /**
   * ✅ Utility: Lấy giá vé matrix (seat type x day type)
   */
  getPriceMatrix: (prices, cinemaId) => {
    const filtered = prices.filter((p) => p.cinemaId === cinemaId);

    return {
      CLASSIC: {
        WEEKDAY:
          filtered.find(
            (p) => p.seatType === "CLASSIC" && p.dayType === "WEEKDAY"
          )?.price || 0,
        WEEKEND:
          filtered.find(
            (p) => p.seatType === "CLASSIC" && p.dayType === "WEEKEND"
          )?.price || 0,
        HOLIDAY:
          filtered.find(
            (p) => p.seatType === "CLASSIC" && p.dayType === "HOLIDAY"
          )?.price || 0,
      },
      VIP: {
        WEEKDAY:
          filtered.find((p) => p.seatType === "VIP" && p.dayType === "WEEKDAY")
            ?.price || 0,
        WEEKEND:
          filtered.find((p) => p.seatType === "VIP" && p.dayType === "WEEKEND")
            ?.price || 0,
        HOLIDAY:
          filtered.find((p) => p.seatType === "VIP" && p.dayType === "HOLIDAY")
            ?.price || 0,
      },
    };
  },
};

export default ticketPriceService;
