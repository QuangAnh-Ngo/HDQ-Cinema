import { Link, useLocation } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";
import "../../styles/AdminLayout.scss";

const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  const breadcrumbNames = {
    admin: "Admin",
    dashboard: "Dashboard",
    movies: "Quản lý phim",
    cinemas: "Quản lý rạp",
    rooms: "Quản lý phòng",
    showtimes: "Lịch chiếu",
    bookings: "Đặt vé",
  };

  return (
    <nav className="breadcrumb">
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
        const isLast = index === pathnames.length - 1;

        return (
          <div key={name}>
            {isLast ? (
              <span className="current">{breadcrumbNames[name] || name}</span>
            ) : (
              <>
                <Link to={routeTo}>{breadcrumbNames[name] || name}</Link>
                <FiChevronRight size={16} />
              </>
            )}
          </div>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
