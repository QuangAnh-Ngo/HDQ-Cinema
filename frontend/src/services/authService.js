// frontend/src/services/authService.js
import axiosInstance from "./axiosInstance";

// ✅ MOCK DATA - CHỈ DÙNG KHI BACKEND CHƯA CÓ TEST USERS
const ENABLE_MOCK = true; // Đổi thành false khi có backend thật

const mockUsers = {
  member1: {
    username: "member1",
    password: "123456",
    token: "mock-token-member1-xyz123",
    user: {
      id: "mock-member-001",
      username: "member1",
      email: "member1@cinema.com",
      fullName: "Nguyễn Văn Member",
      phone: "0123456789",
      role: "MEMBER", // ✅ Add role field
      roles: ["ROLE_MEMBER"],
    },
  },
  employee1: {
    username: "employee1",
    password: "123456",
    token: "mock-token-employee1-xyz456",
    user: {
      id: "mock-employee-001",
      username: "employee1",
      email: "employee1@cinema.com",
      fullName: "Trần Thị Employee",
      phone: "0987654321",
      role: "EMPLOYEE", // ✅ Add role field
      roles: ["ROLE_EMPLOYEE"],
    },
  },
  manager1: {
    username: "manager1",
    password: "123456",
    token: "mock-token-manager1-xyz789",
    user: {
      id: "mock-manager-001",
      username: "manager1",
      email: "manager1@cinema.com",
      fullName: "Lê Văn Manager",
      phone: "0369852147",
      role: "MANAGER", // ✅ Add role field
      roles: ["ROLE_MANAGER"],
    },
  },
  admin1: {
    username: "admin1",
    password: "123456",
    token: "mock-token-admin1-xyzabc",
    user: {
      id: "mock-admin-001",
      username: "admin1",
      email: "admin1@cinema.com",
      fullName: "Phạm Thị Admin",
      phone: "0258963147",
      role: "ADMIN", // ✅ Add role field
      roles: ["ROLE_ADMIN"],
    },
  },
};

export const authService = {
  /**
   * Login - Hỗ trợ cả mock và real API
   */
  login: async (username, password) => {
    // ✅ MOCK MODE - Giả lập đăng nhập
    if (ENABLE_MOCK && mockUsers[username]) {
      const mockUser = mockUsers[username];

      // Kiểm tra password
      if (mockUser.password !== password) {
        throw {
          status: 401,
          message: "Sai mật khẩu",
          code: 1001,
        };
      }

      // Giả lập delay API (realistic)
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Lưu token và user info
      localStorage.setItem("token", mockUser.token);
      localStorage.setItem("user", JSON.stringify(mockUser.user));

      console.log("🎭 Mock login successful:", {
        username: mockUser.username,
        roles: mockUser.user.roles,
      });

      return {
        token: mockUser.token,
        user: mockUser.user,
      };
    }

    // ✅ REAL API MODE
    try {
      console.log("🔐 Real API login:", { username });

      const response = await axiosInstance.post("/auth/token", {
        username,
        password,
      });

      const token = response?.token;
      const user = response?.user;

      if (token) {
        localStorage.setItem("token", token);

        if (user) {
          localStorage.setItem("user", JSON.stringify(user));
        } else {
          await authService.fetchAndStoreUserInfo();
        }

        return response;
      }

      throw new Error("Login failed - no token received");
    } catch (error) {
      console.error("❌ Login error:", error);
      throw error;
    }
  },

  /**
   * Lấy thông tin người dùng hiện tại
   */
  fetchAndStoreUserInfo: async () => {
    // ✅ MOCK MODE - Bỏ qua fetch vì đã có user info
    if (ENABLE_MOCK) {
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        console.log("🎭 Mock: User info already stored");
        return currentUser;
      }
    }

    // ✅ REAL API MODE
    try {
      const response = await axiosInstance.get("/members/my-info");

      if (response) {
        localStorage.setItem("user", JSON.stringify(response));
        return response;
      }
    } catch (error) {
      try {
        const empResponse = await axiosInstance.get("/accounts/my-info");

        if (empResponse) {
          localStorage.setItem("user", JSON.stringify(empResponse));
          return empResponse;
        }
      } catch (e) {
        console.error("Fetch user info error:", e);
      }
    }
  },

  /**
   * Logout
   */
  logout: async () => {
    // ✅ MOCK MODE - Chỉ xóa localStorage
    if (ENABLE_MOCK) {
      console.log("🎭 Mock logout");
      localStorage.clear();
      window.location.href = "/login";
      return;
    }

    // ✅ REAL API MODE
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await axiosInstance.post("/auth/logout", { token });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.clear();
      window.location.href = "/login";
    }
  },

  /**
   * Introspect - Kiểm tra token
   */
  introspect: async () => {
    // ✅ MOCK MODE - Luôn trả về valid nếu có token
    if (ENABLE_MOCK) {
      const token = localStorage.getItem("token");
      return { valid: !!token };
    }

    // ✅ REAL API MODE
    try {
      const token = localStorage.getItem("token");
      if (!token) return { valid: false };

      const response = await axiosInstance.post("/auth/introspect", { token });
      return response || { valid: false };
    } catch (error) {
      console.error("Introspect error:", error);
      return { valid: false };
    }
  },

  /**
   * Refresh token
   */
  refresh: async () => {
    // ✅ MOCK MODE - Không cần refresh
    if (ENABLE_MOCK) {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token to refresh");
      return token; // Trả về token cũ
    }

    // ✅ REAL API MODE
    try {
      const currentToken = localStorage.getItem("token");
      if (!currentToken) throw new Error("No token to refresh");

      const response = await axiosInstance.post("/auth/refresh", {
        token: currentToken,
      });

      if (response?.token) {
        localStorage.setItem("token", response.token);
        return response.token;
      }

      throw new Error("Refresh failed");
    } catch (error) {
      console.error("Refresh error:", error);
      throw error;
    }
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },

  getRoles: () => {
    const user = authService.getCurrentUser();
    if (!user) return [];

    // Backend có thể trả về roles dạng:
    // 1. Array of strings: ["EMPLOYEE", "MANAGER"]
    // 2. Array of objects: [{ name: "EMPLOYEE", ... }]
    // 3. Simple string: "EMPLOYEE" (for mock)

    if (!user.roles) return [];

    if (Array.isArray(user.roles)) {
      return user.roles
        .map((role) => {
          if (typeof role === "string") {
            // "ROLE_EMPLOYEE" → "EMPLOYEE"
            return role.replace(/^ROLE_/, "");
          }
          // { name: "EMPLOYEE" } → "EMPLOYEE"
          return role.name?.replace(/^ROLE_/, "") || "";
        })
        .filter(Boolean);
    }

    // Single role string
    if (typeof user.roles === "string") {
      return [user.roles.replace(/^ROLE_/, "")];
    }

    return [];
  },

  hasRole: (roleName) => {
    const roles = authService.getRoles();
    return roles.includes(roleName);
  },

  /**
   * ✅ Check if user has ANY of the roles
   */
  hasAnyRole: (...roleNames) => {
    const roles = authService.getRoles();
    return roleNames.some((role) => roles.includes(role));
  },

  /**
   * ✅ Get highest role for display
   */
  getHighestRole: () => {
    const roles = authService.getRoles();
    const hierarchy = ["ADMIN", "MANAGER", "EMPLOYEE", "MEMBER"];

    for (const role of hierarchy) {
      if (roles.includes(role)) return role;
    }

    return "GUEST";
  },

  /**
   * ✅ Check if user is admin
   */
  isAdmin: () => {
    return authService.hasRole("ADMIN");
  },

  /**
   * ✅ Check if user is manager or above
   */
  isManagerOrAbove: () => {
    return authService.hasAnyRole("ADMIN", "MANAGER");
  },

  /**
   * ✅ Check if user is staff (employee/manager/admin)
   */
  isStaff: () => {
    return authService.hasAnyRole("ADMIN", "MANAGER", "EMPLOYEE");
  },
};

export default authService;
