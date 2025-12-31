import adminApi from "./adminApi";
import {
  adaptRoomsFromDB,
  adaptRoomFromDB,
  adaptRoomForDB,
} from "../utils/dataAdapters";

export const getRooms = async (params = {}) => {
  try {
    const response = await adminApi.get("/rooms", { params });
    const rooms = response.data.rooms || response.data;
    return { rooms: adaptRoomsFromDB(rooms) };
  } catch (error) {
    throw error.response?.data || { message: "Lỗi khi tải danh sách phòng" };
  }
};

export const getRoomsByCinema = async (cinemaId) => {
  try {
    // json-server sẽ filter theo cinemaId
    const response = await adminApi.get(`/rooms?cinemaId=${cinemaId}`);
    const rooms = response.data.rooms || response.data;
    return { rooms: adaptRoomsFromDB(rooms) };
  } catch (error) {
    throw error.response?.data || { message: "Lỗi khi tải danh sách phòng" };
  }
};

export const getRoomById = async (id) => {
  try {
    const response = await adminApi.get(`/rooms/${id}`);
    return adaptRoomFromDB(response.data);
  } catch (error) {
    throw error.response?.data || { message: "Lỗi khi tải thông tin phòng" };
  }
};

export const createRoom = async (roomData) => {
  try {
    const allRooms = await getRooms();
    const newId = Math.max(...allRooms.rooms.map((r) => r.id), 0) + 1;

    const dataToSend = adaptRoomForDB({
      ...roomData,
      id: newId,
      createdAt: new Date().toISOString(),
    });

    const response = await adminApi.post("/rooms", dataToSend);
    return adaptRoomFromDB(response.data);
  } catch (error) {
    throw error.response?.data || { message: "Lỗi khi tạo phòng mới" };
  }
};

export const updateRoom = async (id, roomData) => {
  try {
    const dataToSend = adaptRoomForDB({
      ...roomData,
      id,
      updatedAt: new Date().toISOString(),
    });

    const response = await adminApi.put(`/rooms/${id}`, dataToSend);
    return adaptRoomFromDB(response.data);
  } catch (error) {
    throw error.response?.data || { message: "Lỗi khi cập nhật phòng" };
  }
};

export const deleteRoom = async (id) => {
  try {
    const response = await adminApi.delete(`/rooms/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Lỗi khi xóa phòng" };
  }
};

export const getSeatLayout = async (roomId) => {
  try {
    const room = await getRoomById(roomId);
    return { seats: room.seats || [] };
  } catch (error) {
    throw error.response?.data || { message: "Lỗi khi tải sơ đồ ghế" };
  }
};

export const updateSeatLayout = async (roomId, seatData) => {
  try {
    const room = await getRoomById(roomId);

    const dataToSend = adaptRoomForDB({
      ...room,
      seats: seatData.seats,
      updatedAt: new Date().toISOString(),
    });

    const response = await adminApi.put(`/rooms/${roomId}`, dataToSend);
    return adaptRoomFromDB(response.data);
  } catch (error) {
    throw error.response?.data || { message: "Lỗi khi cập nhật sơ đồ ghế" };
  }
};

export const updateRoomStatus = async (id, status) => {
  try {
    const room = await getRoomById(id);
    const response = await adminApi.patch(`/rooms/${id}`, {
      ...room,
      status,
      updatedAt: new Date().toISOString(),
    });
    return adaptRoomFromDB(response.data);
  } catch (error) {
    throw error.response?.data || { message: "Lỗi khi thay đổi trạng thái" };
  }
};

export const getRoomStats = async (id) => {
  try {
    const response = await adminApi.get(`/rooms/${id}/stats`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Lỗi khi tải thống kê" };
  }
};
