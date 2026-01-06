// frontend/src/admin/services/rooms.js
import axiosInstance from "../../services/axiosInstance";
import { API_ENDPOINTS } from "../../config/api";

/**
 * Get all rooms
 */
export const getRooms = async (params = {}) => {
  try {
    // Backend endpoint: GET /rooms
    const rooms = await axiosInstance.get(API_ENDPOINTS.ROOMS, { params });
    return { rooms: Array.isArray(rooms) ? rooms : [] };
  } catch (error) {
    console.error("Get rooms error:", error);
    throw error;
  }
};

/**
 * Get rooms by cinema
 */
export const getRoomsByCinema = async (cinemaId) => {
  try {
    // Backend có thể hỗ trợ query param ?cinemaId=
    // Hoặc có endpoint riêng /cinemas/{cinemaId}/rooms
    const rooms = await axiosInstance.get(API_ENDPOINTS.ROOMS, {
      params: { cinemaId },
    });
    return { rooms: Array.isArray(rooms) ? rooms : [] };
  } catch (error) {
    console.error("Get rooms by cinema error:", error);
    throw error;
  }
};

/**
 * Get room by ID
 */
export const getRoomById = async (id) => {
  try {
    // Backend endpoint: GET /rooms/{roomId}
    const room = await axiosInstance.get(API_ENDPOINTS.ROOM_BY_ID(id));
    return room;
  } catch (error) {
    console.error("Get room error:", error);
    throw error;
  }
};

/**
 * Create room
 */
export const createRoom = async (roomData) => {
  try {
    // Backend endpoint: POST /rooms
    // Body theo RoomRequest
    const payload = {
      cinemaId: roomData.cinemaId,
      name: roomData.name,
      capacity: parseInt(roomData.capacity),
      status: roomData.status || "active",
    };

    const room = await axiosInstance.post(API_ENDPOINTS.ROOMS, payload);
    return room;
  } catch (error) {
    console.error("Create room error:", error);
    throw error;
  }
};

/**
 * Update room
 */
export const updateRoom = async (id, roomData) => {
  try {
    // Backend endpoint: PUT /rooms/{roomId}
    const payload = {
      cinemaId: roomData.cinemaId,
      name: roomData.name,
      capacity: parseInt(roomData.capacity),
      status: roomData.status,
    };

    const room = await axiosInstance.put(API_ENDPOINTS.ROOM_BY_ID(id), payload);
    return room;
  } catch (error) {
    console.error("Update room error:", error);
    throw error;
  }
};

/**
 * Delete room
 */
export const deleteRoom = async (id) => {
  try {
    // Backend endpoint: DELETE /rooms/{roomId}
    await axiosInstance.delete(API_ENDPOINTS.ROOM_BY_ID(id));
  } catch (error) {
    console.error("Delete room error:", error);
    throw error;
  }
};

/**
 * Get seat layout - Lấy danh sách ghế trong phòng
 */
export const getSeatLayout = async (roomId) => {
  try {
    // Backend endpoint: GET /seats?roomId={roomId}
    const seats = await axiosInstance.get(API_ENDPOINTS.SEATS, {
      params: { roomId },
    });
    return { seats: Array.isArray(seats) ? seats : [] };
  } catch (error) {
    console.error("Get seat layout error:", error);
    throw error;
  }
};

/**
 * Update seat layout - Tạo/cập nhật ghế hàng loạt
 * Backend có endpoint POST /seats với body là array SeatCreationRequest
 */
export const updateSeatLayout = async (roomId, seatData) => {
  try {
    // seatData.seats là array các seat objects
    // Backend endpoint: POST /seats (bulk create)
    const payload = seatData.seats.map((seat) => ({
      roomId: roomId,
      seatRow: seat.row || seat.seatRow,
      seatNumber: seat.number || seat.seatNumber,
      seatType: seat.type || seat.seatType || "NORMAL",
      seatStatus: seat.status || seat.seatStatus || "AVAILABLE",
    }));

    const result = await axiosInstance.post(API_ENDPOINTS.SEATS, payload);
    return result;
  } catch (error) {
    console.error("Update seat layout error:", error);
    throw error;
  }
};

/**
 * Update room status
 */
export const updateRoomStatus = async (id, status) => {
  try {
    const room = await getRoomById(id);
    const updatedRoom = await updateRoom(id, {
      ...room,
      status,
    });
    return updatedRoom;
  } catch (error) {
    console.error("Update room status error:", error);
    throw error;
  }
};

/**
 * Get room stats
 */
export const getRoomStats = async (id) => {
  try {
    // Backend chưa có endpoint stats riêng
    // Tạm tính từ client
    const showtimes = await axiosInstance.get(API_ENDPOINTS.SHOWTIMES, {
      params: { roomId: id },
    });

    return {
      totalShowtimes: showtimes.length,
    };
  } catch (error) {
    console.error("Get room stats error:", error);
    return { totalShowtimes: 0 };
  }
};

/**
 * Get rooms available for showtime - Dùng cho tạo lịch chiếu
 */
export const getRoomsForShowtime = async (params) => {
  try {
    // Backend endpoint: GET /rooms/for-showtime
    // Query params: cinemaId, date, startTime, endTime, movieDuration
    const rooms = await axiosInstance.get(API_ENDPOINTS.ROOMS_FOR_SHOWTIME, {
      params: {
        cinemaId: params.cinemaId,
        date: params.date,
        startTime: params.startTime,
        endTime: params.endTime,
        movieDuration: params.movieDuration,
      },
    });
    return { rooms: Array.isArray(rooms) ? rooms : [] };
  } catch (error) {
    console.error("Get rooms for showtime error:", error);
    throw error;
  }
};
