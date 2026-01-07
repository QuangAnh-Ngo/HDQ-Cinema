// frontend/src/services/cinemaService.js
import axiosInstance from "./axiosInstance";

export const cinemaService = {
  /**
   * Get all cinemas (GET /theaters)
   * Response: { id, name, city, district, address, rooms[] }
   */
  getAll: async () => {
    try {
      const response = await axiosInstance.get("/theaters");
      return response || [];
    } catch (error) {
      console.error("Get cinemas error:", error);
      throw error;
    }
  },

  /**
   * Get cinema by ID (GET /theaters/{cinemaId})
   */
  getById: async (id) => {
    try {
      const response = await axiosInstance.get(`/theaters/${id}`);
      return response;
    } catch (error) {
      console.error("Get cinema error:", error);
      throw error;
    }
  },

  /**
   * Create new cinema (POST /theaters)
   * Payload: { name, city, district, address }
   */
  create: async (data) => {
    try {
      const payload = {
        name: data.name,
        city: data.city,
        district: data.district,
        address: data.address,
      };

      console.log("📤 Creating cinema:", payload);

      const response = await axiosInstance.post("/theaters", payload);

      console.log("✅ Cinema created:", response);

      return response;
    } catch (error) {
      console.error("❌ Create cinema error:", error);
      throw error;
    }
  },

  /**
   * Update cinema (PUT /theaters/{cinemaId})
   * ⚠️ NOTE: Not in Swagger - may not work
   */
  update: async (id, data) => {
    try {
      const payload = {
        name: data.name,
        city: data.city,
        district: data.district,
        address: data.address,
      };

      console.log("📤 Updating cinema:", id, payload);

      const response = await axiosInstance.put(`/theaters/${id}`, payload);

      console.log("✅ Cinema updated:", response);

      return response;
    } catch (error) {
      console.error("❌ Update cinema error:", error);
      throw error;
    }
  },

  /**
   * Delete cinema (DELETE /theaters/{cinemaId})
   * ⚠️ NOTE: Not in Swagger - may not work
   */
  delete: async (id) => {
    try {
      console.log("📤 Deleting cinema:", id);

      await axiosInstance.delete(`/theaters/${id}`);

      console.log("✅ Cinema deleted:", id);
    } catch (error) {
      console.error("❌ Delete cinema error:", error);
      throw error;
    }
  },

  /**
   * Get cinema stats (rooms count)
   */
  getStats: async (id) => {
    try {
      const cinema = await cinemaService.getById(id);
      return {
        totalRooms: cinema.rooms?.length || 0,
      };
    } catch (error) {
      console.error("Get cinema stats error:", error);
      return { totalRooms: 0 };
    }
  },
};

export default cinemaService;
