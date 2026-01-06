// frontend/src/admin/AdminProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { authService } from "../services";

/**
 * Protected route for admin pages
 * Checks authentication and role permissions
 */
const AdminProtectedRoute = ({ children, allowedRoles = [] }) => {
  const isAuthenticated = authService.isAuthenticated();
  const userRoles = authService.getRoles();

  console.log("🔐 AdminProtectedRoute check:", {
    isAuthenticated,
    userRoles,
    allowedRoles,
  });

  // ✅ Not authenticated → Redirect to login
  if (!isAuthenticated) {
    console.log("❌ Not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  // ✅ No role restriction → Allow if staff
  if (allowedRoles.length === 0) {
    const isStaff = authService.isStaff();

    if (!isStaff) {
      console.log("❌ Not staff, redirecting to home");
      return <Navigate to="/" replace />;
    }

    return children;
  }

  // ✅ Check if user has any of the allowed roles
  const hasPermission = allowedRoles.some((role) => userRoles.includes(role));

  if (!hasPermission) {
    console.log("❌ No permission, redirecting to admin dashboard");
    return <Navigate to="/admin/dashboard" replace />;
  }

  // ✅ All checks passed
  return children;
};

export default AdminProtectedRoute;
