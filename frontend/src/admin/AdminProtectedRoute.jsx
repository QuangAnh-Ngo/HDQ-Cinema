import { Navigate, useLocation } from "react-router-dom";

const AdminProtectedRoute = ({ children, allowedRoles }) => {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!token)
    return <Navigate to="/login" state={{ from: location }} replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === "member") {
      return <Navigate to="/" replace />;
    }
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};

export default AdminProtectedRoute;
