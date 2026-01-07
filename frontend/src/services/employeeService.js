// frontend/src/services/employeeService.js
import axiosInstance from "./axiosInstance";

export const employeeService = {
  getAll: async () => {
    try {
      const response = await axiosInstance.get("/employees");
      return response?.result || [];
    } catch (error) {
      console.error("Get employees error:", error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || data.phoneNumber,
        email: data.email,
      };
      const response = await axiosInstance.post("/employees", payload);
      return response;
    } catch (error) {
      console.error("Create employee error:", error);
      throw error;
    }
  },

  /**
   * ✅ FIX: PUT uses {employeeAccountId} not {employeeId}
   */
  update: async (employeeAccountId, data) => {
    try {
      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || data.phoneNumber,
        email: data.email,
      };
      const response = await axiosInstance.put(
        `/employees/${employeeAccountId}`,
        payload
      );
      return response;
    } catch (error) {
      console.error("Update employee error:", error);
      throw error;
    }
  },

  /**
   * ✅ DELETE uses {employeeId}
   */
  delete: async (employeeId) => {
    try {
      await axiosInstance.delete(`/employees/${employeeId}`);
    } catch (error) {
      console.error("Delete employee error:", error);
      throw error;
    }
  },
};

export default employeeService;
