// frontend/src/services/seatService.js
import axiosInstance from "./axiosInstance";

export const seatService = {
  /**
   * Lấy danh sách ghế theo suất chiếu (GET /seats/showtime/{showtimeId})
   * @param {string} showtimeId - Showtime ID
   * @returns {Promise<Array>} Mảng ghế với thông tin trạng thái
   */
  getByShowtime: async (showtimeId) => {
    try {
      const response = await axiosInstance.get(`/seats/showtime/${showtimeId}`);
      // Response structure: Array of seats
      // Each seat: { id, seatNumber, seatRow, type, status, price, roomId, showtimeId }
      return response || [];
    } catch (error) {
      console.error("Get seats by showtime error:", error);
      throw error;
    }
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
   * @param {Object} data - { seatNumber, seatRow, type, price, roomId }
   * @returns {Promise<Object>}
   */
  create: async (data) => {
    try {
      const payload = {
        seatNumber: parseInt(data.seatNumber, 10), // Số ghế (1, 2, 3...)
        seatRow: data.seatRow, // Hàng ghế (A, B, C...)
        type: data.type, // STANDARD, VIP, COUPLE
        price: parseFloat(data.price), // Giá ghế
        roomId: data.roomId, // Room ID
      };
      const response = await axiosInstance.post("/seats", payload);
      return response;
    } catch (error) {
      console.error("Create seat error:", error);
      throw error;
    }
  },

  /**
   * Tạo ghế hàng loạt (Bulk create)
   * API không có sẵn endpoint bulk create, cần loop create
   * @param {Object} data - { firstRow, lastRow, firstColumn, lastColumn, type, price, roomId }
   * @returns {Promise<Array>}
   */
  createBulk: async (data) => {
    try {
      const seats = [];
      const firstRowCode = data.firstRow.charCodeAt(0);
      const lastRowCode = data.lastRow.charCodeAt(0);

      // Tạo từng ghế
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
   * Cập nhật ghế (PUT /seats/{seatId})
   * @param {string} id - Seat ID
   * @param {Object} data - { seatNumber, seatRow, type, price, roomId }
   * @returns {Promise<Object>}
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
   * Kiểm tra ghế có available không (Utility function)
   * @param {Array} seats - Danh sách ghế từ getByShowtime
   * @param {string} seatId - Seat ID cần kiểm tra
   * @returns {boolean}
   */
  isAvailable: (seats, seatId) => {
    const seat = seats.find((s) => s.id === seatId);
    return seat?.status === "AVAILABLE";
  },

  /**
   * Lọc ghế theo trạng thái (Utility function)
   * @param {Array} seats - Danh sách ghế
   * @param {string} status - AVAILABLE, BOOKED, RESERVED
   * @returns {Array}
   */
  filterByStatus: (seats, status) => {
    return seats.filter((seat) => seat.status === status);
  },

  /**
   * Nhóm ghế theo hàng (Utility function cho UI)
   * @param {Array} seats - Danh sách ghế
   * @returns {Object} { "A": [...], "B": [...] }
   */
  groupByRow: (seats) => {
    return seats.reduce((groups, seat) => {
      const row = seat.seatRow;
      if (!groups[row]) {
        groups[row] = [];
      }
      groups[row].push(seat);
      return groups;
    }, {});
  },
};

export default seatService;
