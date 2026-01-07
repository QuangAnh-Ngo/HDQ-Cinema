// frontend/src/services/seatService.js
import axiosInstance from "./axiosInstance";
import roomService from "./roomService";

export const seatService = {
  getSeatsByShowtime: async (showtimeId) => {
    return roomService.getRoomByShowtime(showtimeId);
  },

  /**
   * Lấy danh sách ghế theo phòng (GET /seats/room/{roomId})
   * @param {string} roomId - Room ID
   * @returns {Promise<Array>} Mảng tất cả ghế trong phòng
   */
  getByRoom: async (roomId) => {
    try {
      const response = await axiosInstance.get(`/seats/room/${roomId}`);
      return response || [];
    } catch (error) {
      console.error("Get seats by room error:", error);
      throw error;
    }
  },

  /**
   * Tạo ghế mới (POST /seats)
   */
  create: async (data) => {
    try {
      const payload = {
        seatNumber: parseInt(data.seatNumber, 10),
        seatRow: data.seatRow,
        type: data.type,
        price: parseFloat(data.price),
        roomId: data.roomId,
      };
      const response = await axiosInstance.post("/seats", payload);
      return response;
    } catch (error) {
      console.error("Create seat error:", error);
      throw error;
    }
  },

  /**
   * Tạo ghế hàng loạt
   */
  createBulk: async (data) => {
    try {
      const seats = [];
      const firstRowCode = data.firstRow.charCodeAt(0);
      const lastRowCode = data.lastRow.charCodeAt(0);

      for (let row = firstRowCode; row <= lastRowCode; row++) {
        for (let col = data.firstColumn; col <= data.lastColumn; col++) {
          const seatData = {
            seatNumber: col,
            seatRow: String.fromCharCode(row),
            type: data.type || "STANDARD",
            price: parseFloat(data.price),
            roomId: data.roomId,
          };

          const seat = await seatService.create(seatData);
          seats.push(seat);
        }
      }

      return seats;
    } catch (error) {
      console.error("Bulk create seats error:", error);
      throw error;
    }
  },

  /**
   * Cập nhật ghế
   */
  update: async (id, data) => {
    try {
      const payload = {
        seatNumber: parseInt(data.seatNumber, 10),
        seatRow: data.seatRow,
        type: data.type,
        price: parseFloat(data.price),
        roomId: data.roomId,
      };
      const response = await axiosInstance.put(`/seats/${id}`, payload);
      return response;
    } catch (error) {
      console.error("Update seat error:", error);
      throw error;
    }
  },

  /**
   * ✅ Utility: Nhóm ghế theo hàng (dùng seatName thay vì seatRow)
   * @param {Array} seats - Array of { seatId, seatName, seatType, seatStatus, price }
   * @returns {Object} { "A": [...], "B": [...] }
   */
  groupByRow: (seats) => {
    return seats.reduce((groups, seat) => {
      const row = seat.seatName.charAt(0); // "A1" → "A"
      if (!groups[row]) {
        groups[row] = [];
      }
      groups[row].push(seat);
      return groups;
    }, {});
  },

  /**
   * Utility: Sort seats trong row
   */
  sortSeatsInRow: (seats) => {
    return seats.sort((a, b) => {
      const numA = parseInt(a.seatName.substring(1)) || 0;
      const numB = parseInt(b.seatName.substring(1)) || 0;
      return numA - numB;
    });
  },
};

export default seatService;
