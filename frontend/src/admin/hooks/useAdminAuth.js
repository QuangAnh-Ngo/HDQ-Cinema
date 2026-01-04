import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const useAdminAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const hasPermission = user.role === "admin" || user.role === "manager";

    if (token && hasPermission) {
      setUser(user);
      setLoading(false);
    } else {
      navigate("/login");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.setItem("user", "{}");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");

    setUser(null);
    navigate("/login");
  };

  return { user, loading, logout };
};
