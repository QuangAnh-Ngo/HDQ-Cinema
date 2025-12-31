import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiBell, FiUser, FiLogOut } from "react-icons/fi";
import "../../styles/AdminLayout.scss";

const Header = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName") || "Admin";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    navigate("/login");
  };

  return (
    <header className="admin-header">
      <h2>Quản trị hệ thống</h2>

      <div className="header-actions">
        <button>
          <FiBell size={20} />
          <span className="badge"></span>
        </button>

        <div className="user-menu">
          <button
            className="user-button"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <FiUser size={20} />
            <span className="user-name">{userName}</span>
          </button>

          {showDropdown && (
            <div className="dropdown">
              <button onClick={handleLogout}>
                <FiLogOut size={16} />
                <span>Đăng xuất</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
