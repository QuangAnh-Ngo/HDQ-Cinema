// frontend/src/services/authService.js
import axiosInstance from "./axiosInstance";

const ENABLE_MOCK = false;

// ✅ ADD: Helper function to decode JWT
const decodeJWT = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("❌ Failed to decode JWT:", error);
    return null;
  }
};

const mockUsers = {
  // ... keep existing mock users
};

export const authService = {
  /**
   * ✅ Login - Decode JWT to get memberId
   */
  login: async (username, password) => {
    // MOCK MODE
    if (ENABLE_MOCK && mockUsers[username]) {
      const mockUser = mockUsers[username];

      if (mockUser.password !== password) {
        throw { status: 401, message: "Sai mật khẩu", code: 1001 };
      }

      await new Promise((resolve) => setTimeout(resolve, 500));

      localStorage.setItem("token", mockUser.token);
      localStorage.setItem("user", JSON.stringify(mockUser.user));

      return { token: mockUser.token, user: mockUser.user };
    }

    // ✅ REAL API MODE
    try {
      console.log("🔐 Attempting login for:", username);

      const response = await axiosInstance.post("/auth/token", {
        username,
        password,
      });

      const token = response?.token;

      if (!token) {
        throw new Error("Login failed - no token received");
      }

      localStorage.setItem("token", token);

      // ✅ FIX: Decode JWT to get memberId
      const decoded = decodeJWT(token);
      console.log("🔓 Decoded token:", decoded);

      // ✅ Fetch user info and merge with decoded data
      const userInfo = await authService.fetchAndStoreUserInfo(decoded);

      console.log("✅ Login complete:", { username, userInfo });

      return { token, user: userInfo };
    } catch (error) {
      console.error("❌ Login error:", error);
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
   * ✅ FIX: Fetch user info and merge with decoded token
   */
  fetchAndStoreUserInfo: async (decodedToken = null) => {
    // Decode token if not passed
    if (!decodedToken) {
      const token = localStorage.getItem("token");
      if (token && !token.startsWith("mock-token")) {
        try {
          const base64Url = token.split(".")[1];
          const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
          decodedToken = JSON.parse(atob(base64));
          console.log("🔓 Decoded token:", decodedToken);
        } catch (e) {
          console.error("Failed to decode token:", e);
        }
      }
    }

    // Try member endpoint
    try {
      console.log("📡 Trying /members/my-info...");

      const response = await axiosInstance.get("/members/my-info");

      if (response) {
        // ✅ FIX: Use accountId from token as memberId
        const userWithRole = {
          ...response,
          memberId:
            decodedToken?.accountId || // ✅ accountId is the real memberId!
            decodedToken?.sub ||
            response.member_id ||
            response.memberId,
          role: "MEMBER",
          roles: response.roles || ["MEMBER"],
        };

        localStorage.setItem("user", JSON.stringify(userWithRole));
        console.log(
          "✅ Member info stored with memberId:",
          userWithRole.memberId
        );

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
          memberId:
            decodedToken?.sub ||
            decodedToken?.memberId ||
            response.employee_account_id ||
            response.employeeAccountId,
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

    // Fallback
    const fallbackUser = {
      username: decodedToken?.sub || "unknown",
      memberId: decodedToken?.sub,
      role: "MEMBER",
      roles: ["MEMBER"],
    };

    localStorage.setItem("user", JSON.stringify(fallbackUser));
    return fallbackUser;
  },

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
    if (!user || !user.roles) return [];

    if (Array.isArray(user.roles)) {
      return user.roles
        .map((role) => {
          if (typeof role === "string") return role.replace(/^ROLE_/, "");
          return role.name?.replace(/^ROLE_/, "") || "";
        })
        .filter(Boolean);
    }

    if (typeof user.roles === "string") {
      return [user.roles.replace(/^ROLE_/, "")];
    }

    return [];
  },

  hasRole: (roleName) => authService.getRoles().includes(roleName),
  hasAnyRole: (...roleNames) =>
    roleNames.some((role) => authService.getRoles().includes(role)),

  getHighestRole: () => {
    const roles = authService.getRoles();
    for (const role of ["ADMIN", "MANAGER", "EMPLOYEE", "MEMBER"]) {
      if (roles.includes(role)) return role;
    }
    return "GUEST";
  },

  isAdmin: () => authService.hasRole("ADMIN"),
  isManagerOrAbove: () => authService.hasAnyRole("ADMIN", "MANAGER"),
  isStaff: () => authService.hasAnyRole("ADMIN", "MANAGER", "EMPLOYEE"),
};

export default authService;
