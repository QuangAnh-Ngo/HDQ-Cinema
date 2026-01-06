// frontend/src/services/roomService.js
import axiosInstance from "./axiosInstance";

// ✅ Cache rooms in memory
let cachedRooms = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const roomService = {
  /**
   * ✅ Get all rooms with caching (from /theaters)
   */
  getAll: async (forceRefresh = false) => {
    try {
      if (!forceRefresh && cachedRooms && cacheTimestamp) {
        const now = Date.now();
        if (now - cacheTimestamp < CACHE_DURATION) {
          console.log("✅ Using cached rooms");
          return cachedRooms;
        }
      }

      const theaters = await axiosInstance.get("/theaters");

      const allRooms = [];
      if (Array.isArray(theaters)) {
        theaters.forEach((theater) => {
          if (theater.rooms && Array.isArray(theater.rooms)) {
            theater.rooms.forEach((room) => {
              allRooms.push({
                ...room,
                id: room.roomId,
                name: room.roomName,
                cinemaId: theater.id,
                cinemaName: theater.name || room.cinemaName,
                cinemaCity: theater.city,
                capacity: room.capacity || 120,
                type: room.type || "2D",
                status: room.status || "active",
              });
            });
          }
        });
      }

      cachedRooms = allRooms;
      cacheTimestamp = Date.now();

      console.log("✅ Fetched and cached rooms:", allRooms.length);
      return allRooms;
    } catch (error) {
      console.error("Get all rooms error:", error);
      return cachedRooms || [];
    }
  },

  /**
   * ✅ Get room by ID (from cache)
   */
  getById: async (roomId) => {
    try {
      const allRooms = await roomService.getAll();

      const room = allRooms.find(
        (r) =>
          String(r.id) === String(roomId) || String(r.roomId) === String(roomId)
      );

      if (!room) {
        console.warn(`Room not found: ${roomId}`);
        return null;
      }

      return room;
    } catch (error) {
      console.error("Get room by ID error:", error);
      return null;
    }
  },

  /**
   * ✅ Get room with seats by showtime
   * API: GET /rooms?showtimeId={id}
   * Response: { roomId, roomName, cinemaName, showtimeId, seats: [...] }
   */
  getRoomByShowtime: async (showtimeId) => {
    try {
      console.log("🔍 Fetching room for showtime:", showtimeId);

      const response = await axiosInstance.get("/rooms", {
        params: { showtimeId },
      });

      console.log("📦 Room response:", response);

      if (!response) {
        console.error("❌ No response from API");
        return null;
      }

      // Handle response structure
      const result = response.result || response;

      console.log("✅ Room with seats:", result);
      console.log("💺 Seats count:", result?.seats?.length || 0);

      return result;
    } catch (error) {
      console.error("❌ Get room by showtime error:", error);
      throw error;
    }
  },

  /**
   * Get rooms by cinema ID
   */
  getByCinema: async (cinemaId) => {
    try {
      const allRooms = await roomService.getAll();
      return allRooms.filter((r) => String(r.cinemaId) === String(cinemaId));
    } catch (error) {
      console.error("Get rooms by cinema error:", error);
      return [];
    }
  },

  /**
   * Create new room (POST /rooms)
   */
  create: async (data) => {
    try {
      const payload = {
        roomName: data.roomName || data.name,
        cinemaId: data.cinemaId,
      };

      console.log("📤 Creating room:", payload);

      const response = await axiosInstance.post("/rooms", payload);

      // Clear cache after creating
      cachedRooms = null;

      console.log("✅ Room created:", response);

      return response;
    } catch (error) {
      console.error("❌ Create room error:", error);
      throw error;
    }
  },

  /**
   * Clear cache manually
   */
  clearCache: () => {
    cachedRooms = null;
    cacheTimestamp = null;
    console.log("✅ Room cache cleared");
  },
};

export default roomService;
