// frontend/src/admin/services/employees.js
import axiosInstance from "../../services/axiosInstance";
import { API_ENDPOINTS } from "../../config/api";

/**
 * Get all employees
 */
export const getEmployees = async (params = {}) => {
  try {
    // Backend endpoint: GET /employees
    const employees = await axiosInstance.get(API_ENDPOINTS.EMPLOYEES, {
      params,
    });
    return { employees: Array.isArray(employees) ? employees : [] };
  } catch (error) {
    console.error("Get employees error:", error);
    throw error;
  }
};

/**
 * Get employee by ID
 */
export const getEmployeeById = async (id) => {
  try {
    // Backend endpoint: GET /employees/{employeeId}
    const employee = await axiosInstance.get(API_ENDPOINTS.EMPLOYEE_BY_ID(id));
    return employee;
  } catch (error) {
    console.error("Get employee error:", error);
    throw error;
  }
};

/**
 * Create employee
 */
export const createEmployee = async (employeeData) => {
  try {
    // Backend endpoint: POST /employees
    // Body theo EmployeeCreationRequest
    const payload = {
      name: employeeData.name,
      dob: employeeData.dob, // Format: dd/MM/yyyy
      email: employeeData.email,
      phoneNumber: employeeData.phoneNumber || employeeData.phone,
      address: employeeData.address,
      position: employeeData.position, // MANAGER, EMPLOYEE
      cinemaId: employeeData.cinemaId,
    };

    const employee = await axiosInstance.post(API_ENDPOINTS.EMPLOYEES, payload);
    return employee;
  } catch (error) {
    console.error("Create employee error:", error);
    throw error;
  }
};

/**
 * Update employee
 */
export const updateEmployee = async (id, employeeData) => {
  try {
    // Backend endpoint: PUT /employees/{employeeId}
    // Body theo EmployeeUpdateRequest
    const payload = {
      name: employeeData.name,
      dob: employeeData.dob,
      email: employeeData.email,
      phoneNumber: employeeData.phoneNumber || employeeData.phone,
      address: employeeData.address,
      position: employeeData.position,
      cinemaId: employeeData.cinemaId,
    };

    const employee = await axiosInstance.put(
      API_ENDPOINTS.EMPLOYEE_BY_ID(id),
      payload
    );
    return employee;
  } catch (error) {
    console.error("Update employee error:", error);
    throw error;
  }
};

/**
 * Delete employee
 */
export const deleteEmployee = async (id) => {
  try {
    // Backend endpoint: DELETE /employees/{employeeId}
    await axiosInstance.delete(API_ENDPOINTS.EMPLOYEE_BY_ID(id));
  } catch (error) {
    console.error("Delete employee error:", error);
    throw error;
  }
};

/**
 * ============================================
 * EMPLOYEE ACCOUNTS (Authentication accounts)
 * ============================================
 */

/**
 * Get all employee accounts
 */
export const getAllEmployeeAccounts = async (params = {}) => {
  try {
    // Backend endpoint: GET /employee-accounts
    const accounts = await axiosInstance.get(API_ENDPOINTS.EMPLOYEE_ACCOUNTS, {
      params,
    });
    return { accounts: Array.isArray(accounts) ? accounts : [] };
  } catch (error) {
    console.error("Get employee accounts error:", error);
    throw error;
  }
};

/**
 * Get employee account by ID
 */
export const getEmployeeAccountById = async (id) => {
  try {
    // Backend endpoint: GET /employee-accounts/{id}
    const account = await axiosInstance.get(
      API_ENDPOINTS.EMPLOYEE_ACCOUNT_BY_ID(id)
    );
    return account;
  } catch (error) {
    console.error("Get employee account error:", error);
    throw error;
  }
};

/**
 * Create employee account
 */
export const createEmployeeAccount = async (accountData) => {
  try {
    // Backend endpoint: POST /employee-accounts
    // Body theo EmployeeAccountCreationRequest
    const payload = {
      username: accountData.username,
      password: accountData.password,
      employeeId: accountData.employeeId,
      roles: accountData.roles || [], // Array of role names: ["ADMIN", "MANAGER"]
      accountStatus: accountData.accountStatus || "ACTIVE",
    };

    const account = await axiosInstance.post(
      API_ENDPOINTS.EMPLOYEE_ACCOUNTS,
      payload
    );
    return account;
  } catch (error) {
    console.error("Create employee account error:", error);
    throw error;
  }
};

/**
 * Update employee account
 */
export const updateEmployeeAccount = async (id, accountData) => {
  try {
    // Backend endpoint: PUT /employee-accounts/{id}
    // Body theo EmployeeAccountUpdateRequest
    const payload = {
      password: accountData.password, // Optional, chỉ gửi nếu muốn đổi password
      roles: accountData.roles,
      accountStatus: accountData.accountStatus,
    };

    // Chỉ gửi các field có giá trị
    Object.keys(payload).forEach((key) => {
      if (payload[key] === undefined || payload[key] === null) {
        delete payload[key];
      }
    });

    const account = await axiosInstance.put(
      API_ENDPOINTS.EMPLOYEE_ACCOUNT_BY_ID(id),
      payload
    );
    return account;
  } catch (error) {
    console.error("Update employee account error:", error);
    throw error;
  }
};

/**
 * Delete employee account
 */
export const deleteEmployeeAccount = async (id) => {
  try {
    // Backend endpoint: DELETE /employee-accounts/{id}
    await axiosInstance.delete(API_ENDPOINTS.EMPLOYEE_ACCOUNT_BY_ID(id));
  } catch (error) {
    console.error("Delete employee account error:", error);
    throw error;
  }
};
