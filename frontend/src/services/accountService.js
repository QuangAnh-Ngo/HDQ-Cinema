// frontend/src/services/accountService.js
import axiosInstance from "./axiosInstance";

export const accountService = {
  /**
   * Get all employee accounts (GET /accounts)
   * Response: [{ employeeAccountId, username, email, roles[], employeeId }]
   */
  getAll: async () => {
    try {
      const response = await axiosInstance.get("/accounts");
      return response || [];
    } catch (error) {
      console.error("Get accounts error:", error);
      throw error;
    }
  },

  /**
   * Get current user info (GET /accounts/my-info)
   */
  getMyInfo: async () => {
    try {
      const response = await axiosInstance.get("/accounts/my-info");
      return response;
    } catch (error) {
      console.error("Get my info error:", error);
      throw error;
    }
  },

  /**
   * Create employee account (POST /accounts)
   * Request: { username, password, email, roles[], employeeId }
   */
  create: async (data) => {
    try {
      const payload = {
        username: data.username,
        password: data.password,
        email: data.email,
        roles: data.roles || ["EMPLOYEE"],
        employeeId: data.employeeId,
      };

      console.log("📤 Create account payload:", payload);

      const response = await axiosInstance.post("/accounts", payload);
      return response;
    } catch (error) {
      console.error("Create account error:", error);
      throw error;
    }
  },

  /**
   * Update employee account (PUT /accounts/{employeeAccountId})
   * Request: { password?, roles[], employeeId? }
   */
  update: async (employeeAccountId, data) => {
    try {
      const payload = {
        roles: data.roles || [],
      };

      if (data.password && data.password.trim()) {
        payload.password = data.password;
      }

      if (data.employeeId) {
        payload.employeeId = data.employeeId;
      }

      console.log("📤 Update account payload:", payload);

      const response = await axiosInstance.put(
        `/accounts/${employeeAccountId}`,
        payload
      );
      return response;
    } catch (error) {
      console.error("Update account error:", error);
      throw error;
    }
  },

  /**
   * Delete employee account (DELETE /accounts/{employeeAccountId})
   */
  delete: async (employeeAccountId) => {
    try {
      await axiosInstance.delete(`/accounts/${employeeAccountId}`);
    } catch (error) {
      console.error("Delete account error:", error);
      throw error;
    }
  },

  /**
   * Extract role names from account
   */
  extractRoles: (account) => {
    if (!account?.roles) return [];
    return account.roles.map((role) => role.name || role);
  },

  /**
   * Get highest role
   */
  getHighestRole: (account) => {
    const roles = accountService.extractRoles(account);
    if (roles.includes("ADMIN")) return "ADMIN";
    if (roles.includes("MANAGER")) return "MANAGER";
    if (roles.includes("EMPLOYEE")) return "EMPLOYEE";
    return null;
  },
};

export default accountService;
