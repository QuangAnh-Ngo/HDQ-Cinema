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
} from "react-icons/fi";
import "../../styles/AdminLayout.scss";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const menuItems = [
    { path: "/admin/dashboard", icon: FiHome, label: "Dashboard" },
    { path: "/admin/movies", icon: FiFilm, label: "Quản lý phim" },
    { path: "/admin/cinemas", icon: FiMapPin, label: "Quản lý rạp" },
    { path: "/admin/rooms", icon: FiGrid, label: "Quản lý phòng" },
    { path: "/admin/showtimes", icon: FiClock, label: "Lịch chiếu" },
    { path: "/admin/bookings", icon: FiShoppingBag, label: "Đặt vé" },
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
        {menuItems.map((item) => (
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
