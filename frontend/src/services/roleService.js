// frontend/src/services/roleService.js
import axiosInstance from "./axiosInstance";

export const roleService = {
  getAll: async () => {
    try {
      const response = await axiosInstance.get("/roles");
      return response || [];
    } catch (error) {
      console.error("Get roles error:", error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const payload = {
        name: data.name,
        description: data.description,
        permissions: data.permissions || [],
      };
      const response = await axiosInstance.post("/roles", payload);
      return response;
    } catch (error) {
      console.error("Create role error:", error);
      throw error;
    }
  },

  /**
   * ✅ FIX: PUT uses {employeeAccountId} not {roleId}
   * This seems like a backend API design issue
   */
  update: async (employeeAccountId, data) => {
    try {
      const payload = {
        name: data.name,
        description: data.description,
        permissions: data.permissions || [],
      };
      const response = await axiosInstance.put(
        `/roles/${employeeAccountId}`,
        payload
      );
      return response;
    } catch (error) {
      console.error("Update role error:", error);
      throw error;
    }
  },

  /**
   * ✅ FIX: DELETE uses {employeeId} not {roleId}
   * This seems like a backend API design issue
   */
  delete: async (employeeId) => {
    try {
      await axiosInstance.delete(`/roles/${employeeId}`);
    } catch (error) {
      console.error("Delete role error:", error);
      throw error;
    }
  },
};

export default roleService;
