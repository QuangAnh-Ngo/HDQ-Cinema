// frontend/src/user/UserProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { authService } from "../services";

/**
 * UserProtectedRoute - Protect user routes
 * @param {ReactNode} children - Components to render
 * @param {boolean} requireAuth - Require authentication (default: true)
 */
const UserProtectedRoute = ({ children, requireAuth = true }) => {
  // If route doesn't require auth, render children
  if (!requireAuth) {
    return children;
  }

  // Check if user is authenticated
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // Check user roles - redirect admins/managers to admin panel
  const roles = authService.getRoles();

  if (
    roles.includes("ADMIN") ||
    roles.includes("MANAGER") ||
    roles.includes("EMPLOYEE")
  ) {
    return <Navigate to="/admin" replace />;
  }

  // User is authenticated and is a regular member
  return children;
};

export default UserProtectedRoute;
