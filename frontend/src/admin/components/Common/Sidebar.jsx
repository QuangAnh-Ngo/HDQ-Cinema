import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FiHome,
  FiFilm,
  FiMapPin,
  FiGrid,
  FiClock,
  FiShoppingBag,
  FiChevronLeft,
  FiChevronRight,
  FiUser,
} from "react-icons/fi";
import "../../styles/AdminLayout.scss";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = user.role; // 'admin' hoặc 'manager'

  const menuItems = [
    {
      path: "/admin/dashboard",
      icon: FiHome,
      label: "Dashboard",
      roles: ["admin", "manager"],
    },
    {
      path: "/admin/movies",
      icon: FiFilm,
      label: "Quản lý phim",
      roles: ["admin", "manager"],
    },
    {
      path: "/admin/cinemas",
      icon: FiMapPin,
      label: "Quản lý rạp",
      roles: ["admin", "manager"],
    },
    {
      path: "/admin/rooms",
      icon: FiGrid,
      label: "Quản lý phòng",
      roles: ["admin", "manager"],
    },
    {
      path: "/admin/showtimes",
      icon: FiClock,
      label: "Lịch chiếu",
      roles: ["admin", "manager"],
    },
    {
      path: "/admin/bookings",
      icon: FiShoppingBag,
      label: "Đặt vé",
      roles: ["admin", "manager"],
    },
    // Mục chỉ dành cho Admin
    {
      path: "/admin/employees",
      icon: FiUser,
      label: "Quản lý nhân sự",
      roles: ["admin"],
    },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className={`admin-sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        {!collapsed && <h1>Cinema Admin</h1>}
        <button onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
        </button>
      </div>

      <nav>
        {menuItems
          .filter((item) => item.roles.includes(userRole))
          .map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={isActive(item.path) ? "active" : ""}
            >
              <item.icon size={20} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
      </nav>
    </div>
  );
};

export default Sidebar;
