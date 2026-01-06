// frontend/src/services/authService.js
import axiosInstance from "./axiosInstance";

// ✅ DISABLE MOCK MODE for real authentication
const ENABLE_MOCK = false; // ← CHANGE TO FALSE

const mockUsers = {
  // ... keep existing mock users for testing
};

export const authService = {
  /**
   * ✅ Login - Fixed to handle API response correctly
   */
  login: async (username, password) => {
    // ✅ MOCK MODE - for development testing
    if (ENABLE_MOCK && mockUsers[username]) {
      const mockUser = mockUsers[username];

      if (mockUser.password !== password) {
        throw {
          status: 401,
          message: "Sai mật khẩu",
          code: 1001,
        };
      }

      await new Promise((resolve) => setTimeout(resolve, 500));

      localStorage.setItem("token", mockUser.token);
      localStorage.setItem("user", JSON.stringify(mockUser.user));

      console.log("🎭 Mock login successful:", mockUser.username);

      return {
        token: mockUser.token,
        user: mockUser.user,
      };
    }

    // ✅ REAL API MODE
    try {
      console.log("🔐 Attempting login for:", username);

      // Step 1: Get token
      const response = await axiosInstance.post("/auth/token", {
        username,
        password,
      });

      console.log("🔑 Token response:", response);

      const token = response?.token;

      if (!token) {
        throw new Error("Login failed - no token received");
      }

      // Step 2: Save token
      localStorage.setItem("token", token);

      // Step 3: Fetch user info (API /auth/token doesn't return user)
      console.log("👤 Fetching user info...");

      const userInfo = await authService.fetchAndStoreUserInfo();

      console.log("✅ Login complete:", { username, userInfo });

      return {
        token,
        user: userInfo,
      };
    } catch (error) {
      console.error("❌ Login error:", error);

      // Clear any partial data
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      throw {
        status: error.status || 401,
        message: error.message || "Đăng nhập thất bại",
        code: error.code,
      };
    }
  },

  /**
   * ✅ Fetch user info after login
   */
  fetchAndStoreUserInfo: async () => {
    // Try member endpoint first
    try {
      console.log("📡 Trying /members/my-info...");

      const response = await axiosInstance.get("/members/my-info");

      if (response) {
        // ✅ Add MEMBER role if not present
        const userWithRole = {
          ...response,
          role: "MEMBER",
          roles: response.roles || ["MEMBER"],
        };

        localStorage.setItem("user", JSON.stringify(userWithRole));

        console.log("✅ Member info stored:", userWithRole);

        return userWithRole;
      }
    } catch (memberError) {
      console.log("ℹ️ Not a member, trying employee...");
    }

    // Try employee/admin endpoint
    try {
      console.log("📡 Trying /accounts/my-info...");

      const response = await axiosInstance.get("/accounts/my-info");

      if (response) {
        // ✅ Extract role from roles array
        const roles = response.roles?.map((r) => r.name || r) || [];
        const highestRole = roles.includes("ADMIN")
          ? "ADMIN"
          : roles.includes("MANAGER")
          ? "MANAGER"
          : roles.includes("EMPLOYEE")
          ? "EMPLOYEE"
          : "MEMBER";

        const userWithRole = {
          ...response,
          role: highestRole,
          roles: roles,
        };

        localStorage.setItem("user", JSON.stringify(userWithRole));

        console.log("✅ Account info stored:", userWithRole);

        return userWithRole;
      }
    } catch (accountError) {
      console.error("❌ Failed to fetch user info:", accountError);
    }

    // If both fail, create minimal user object
    const fallbackUser = {
      username: "unknown",
      role: "MEMBER",
      roles: ["MEMBER"],
    };

    localStorage.setItem("user", JSON.stringify(fallbackUser));

    return fallbackUser;
  },

  // ... keep all other existing methods

  /**
   * Logout
   */
  logout: async () => {
    try {
      const token = localStorage.getItem("token");
      if (token && !token.startsWith("mock-token")) {
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
   * Introspect token
   */
  introspect: async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return { valid: false };

      if (token.startsWith("mock-token")) {
        return { valid: true };
      }

      const response = await axiosInstance.post("/auth/introspect", { token });
      return response || { valid: false };
    } catch (error) {
      console.error("Introspect error:", error);
      return { valid: false };
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

    if (!user.roles) return [];

    if (Array.isArray(user.roles)) {
      return user.roles
        .map((role) => {
          if (typeof role === "string") {
            return role.replace(/^ROLE_/, "");
          }
          return role.name?.replace(/^ROLE_/, "") || "";
        })
        .filter(Boolean);
    }

    if (typeof user.roles === "string") {
      return [user.roles.replace(/^ROLE_/, "")];
    }

    return [];
  },

  hasRole: (roleName) => {
    const roles = authService.getRoles();
    return roles.includes(roleName);
  },

  hasAnyRole: (...roleNames) => {
    const roles = authService.getRoles();
    return roleNames.some((role) => roles.includes(role));
  },

  getHighestRole: () => {
    const roles = authService.getRoles();
    const hierarchy = ["ADMIN", "MANAGER", "EMPLOYEE", "MEMBER"];

    for (const role of hierarchy) {
      if (roles.includes(role)) return role;
    }

    return "GUEST";
  },

  isAdmin: () => authService.hasRole("ADMIN"),
  isManagerOrAbove: () => authService.hasAnyRole("ADMIN", "MANAGER"),
  isStaff: () => authService.hasAnyRole("ADMIN", "MANAGER", "EMPLOYEE"),
};

export default authService;
