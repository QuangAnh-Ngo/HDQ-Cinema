// frontend/src/services/employeeService.js
import axiosInstance from "./axiosInstance";

export const employeeService = {
  /**
   * Get all employees (GET /employees)
   */
  getAll: async () => {
    try {
      const response = await axiosInstance.get("/employees");
      return response || [];
    } catch (error) {
      console.error("Get employees error:", error);
      throw error;
    }
  },

  /**
   * Create employee (POST /employees)
   */
  create: async (data) => {
    try {
      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || data.phoneNumber,
        email: data.email,
      };

      console.log("📤 Create employee payload:", payload);

      const response = await axiosInstance.post("/employees", payload);
      return response;
    } catch (error) {
      console.error("Create employee error:", error);
      throw error;
    }
  },

  /**
   * ✅ Update employee (PUT /employees/{employeeId})
   * employeeId is integer
   */
  update: async (employeeId, data) => {
    try {
      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || data.phoneNumber,
        email: data.email,
      };

      console.log("📤 Update employee payload:", payload);

      const response = await axiosInstance.put(
        `/employees/${employeeId}`,
        payload
      );
      return response;
    } catch (error) {
      console.error("Update employee error:", error);
      throw error;
    }
  },

  /**
   * Delete employee (DELETE /employees/{employeeId})
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
