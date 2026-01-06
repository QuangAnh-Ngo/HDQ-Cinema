// frontend/src/admin/components/Common/Sidebar.jsx
import { Link, useLocation } from "react-router-dom";
import { authService } from "../../../services";
import PermissionWrapper from "./PermissionWrapper";
import "../../styles/AdminLayout.scss";

const Sidebar = () => {
  const location = useLocation();
  const userRole = authService.getHighestRole();
  const userName = authService.getCurrentUser()?.fullName || "User";

  const menuItems = [
    {
      path: "/admin/dashboard",
      label: "Dashboard",
      icon: "fa-chart-line",
      roles: ["EMPLOYEE", "MANAGER", "ADMIN"],
    },
    {
      path: "/admin/movies",
      label: "Quản lý phim",
      icon: "fa-film",
      roles: ["EMPLOYEE", "MANAGER", "ADMIN"],
    },
    {
      path: "/admin/showtimes",
      label: "Quản lý suất chiếu",
      icon: "fa-clock",
      roles: ["EMPLOYEE", "MANAGER", "ADMIN"],
    },
    {
      path: "/admin/bookings",
      label: "Quản lý đặt vé",
      icon: "fa-ticket",
      roles: ["EMPLOYEE", "MANAGER", "ADMIN"],
    },
    {
      path: "/admin/cinemas",
      label: "Quản lý rạp",
      icon: "fa-building",
      roles: ["MANAGER", "ADMIN"],
    },
    {
      path: "/admin/rooms",
      label: "Quản lý phòng",
      icon: "fa-door-open",
      roles: ["MANAGER", "ADMIN"],
    },
    {
      path: "/admin/employees",
      label: "Quản lý nhân viên",
      icon: "fa-users",
      roles: ["MANAGER", "ADMIN"],
    },
  ];

  const getRoleBadgeClass = (role) => {
    const classes = {
      ADMIN: "role-admin",
      MANAGER: "role-manager",
      EMPLOYEE: "role-employee",
    };
    return classes[role] || "role-default";
  };

  return (
    <div className="admin-sidebar">
      {/* User Info */}
      <div className="sidebar-header">
        <div className="user-info">
          <div className="user-avatar">
            <i className="fas fa-user-circle"></i>
          </div>
          <div className="user-details">
            <span className="user-name">{userName}</span>
            <span className={`user-role ${getRoleBadgeClass(userRole)}`}>
              {userRole}
            </span>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="sidebar-menu">
        {menuItems.map((item) => (
          <PermissionWrapper key={item.path} allowedRoles={item.roles}>
            <Link
              to={item.path}
              className={`menu-item ${
                location.pathname === item.path ? "active" : ""
              }`}
            >
              <i className={`fas ${item.icon}`}></i>
              <span>{item.label}</span>
            </Link>
          </PermissionWrapper>
        ))}
      </nav>

      {/* Logout */}
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={() => authService.logout()}>
          <i className="fas fa-sign-out-alt"></i>
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
