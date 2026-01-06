// frontend/src/services/permissionService.js
import axiosInstance from "./axiosInstance";

export const permissionService = {
  getAll: async () => {
    try {
      const response = await axiosInstance.get("/permissions");
      return response || [];
    } catch (error) {
      console.error("Get permissions error:", error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const payload = {
        name: data.name,
        description: data.description,
      };
      const response = await axiosInstance.post("/permissions", payload);
      return response;
    } catch (error) {
      console.error("Create permission error:", error);
      throw error;
    }
  },

  /**
   * ✅ FIX: PUT uses {employeeAccountId} not {permissionId}
   */
  update: async (employeeAccountId, data) => {
    try {
      const payload = {
        name: data.name,
        description: data.description,
      };
      const response = await axiosInstance.put(
        `/permissions/${employeeAccountId}`,
        payload
      );
      return response;
    } catch (error) {
      console.error("Update permission error:", error);
      throw error;
    }
  },

  /**
   * ✅ FIX: DELETE uses {employeeId} not {permissionId}
   */
  delete: async (employeeId) => {
    try {
      await axiosInstance.delete(`/permissions/${employeeId}`);
    } catch (error) {
      console.error("Delete permission error:", error);
      throw error;
    }
  },
};

export default permissionService;
