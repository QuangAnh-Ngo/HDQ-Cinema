// frontend/src/services/accountService.js
import axiosInstance from "./axiosInstance";

export const accountService = {
  /**
   * Get all employee accounts (GET /accounts)
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
   * @param {Object} data - { username, password, email, roles[], employee }
   */
  create: async (data) => {
    try {
      const payload = {
        username: data.username,
        password: data.password, // Min 8 chars
        email: data.email,
        roles: data.roles || [], // Array of role names: ["ADMIN", "MANAGER", "EMPLOYEE"]
        employee: data.employeeId || data.employee, // Employee ID to link
      };
      const response = await axiosInstance.post("/accounts", payload);
      return response;
    } catch (error) {
      console.error("Create account error:", error);
      throw error;
    }
  },

  /**
   * Update employee account (PUT /accounts/{employeeAccountId})
   * @param {string} employeeAccountId - Account ID
   * @param {Object} data - { password?, roles[], employee? }
   */
  update: async (employeeAccountId, data) => {
    try {
      const payload = {
        ...(data.password && { password: data.password }),
        roles: data.roles || [],
        ...(data.employee && { employee: data.employee }),
      };
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
   * Extract roles from account object
   */
  extractRoles: (account) => {
    if (!account || !account.roles) return [];
    return account.roles.map((role) => role.name || role);
  },

  /**
   * Check if account has specific role
   */
  hasRole: (account, roleName) => {
    const roles = accountService.extractRoles(account);
    return roles.includes(roleName);
  },

  /**
   * Get highest role (ADMIN > MANAGER > EMPLOYEE)
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
