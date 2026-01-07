// frontend/src/admin/pages/Showtimes.jsx
import { useState, useEffect } from "react";
import {
  FiPlus,
  FiSearch,
  FiEdit,
  FiTrash2,
  FiClock,
  FiCalendar,
} from "react-icons/fi";
import Breadcrumb from "../components/Common/Breadcrumb";
import Loading from "../components/Common/Loading";
import ConfirmDialog from "../components/Common/ConfirmDialog";
import ShowtimeForm from "../components/ShowtimeForm";
import {
  showtimeService,
  movieService,
  roomService,
  cinemaService,
} from "../../services";
import { message } from "antd";
import "../styles/AdminLayout.scss";

const Showtimes = () => {
  const [showtimes, setShowtimes] = useState([]);
  const [filteredShowtimes, setFilteredShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showShowtimeForm, setShowShowtimeForm] = useState(false);
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showtimeToDelete, setShowtimeToDelete] = useState(null);

  // ✅ Store lookup maps
  const [movieMap, setMovieMap] = useState(new Map());
  const [roomMap, setRoomMap] = useState(new Map());
  const [cinemaMap, setCinemaMap] = useState(new Map());

  useEffect(() => {
    fetchShowtimes();
  }, []);

  useEffect(() => {
    filterShowtimes();
  }, [showtimes, searchTerm, dateFilter, statusFilter]);

  const fetchShowtimes = async () => {
    try {
      setLoading(true);

      // ✅ Fetch all data in parallel
      const [showtimesData, moviesData, cinemasData] = await Promise.all([
        showtimeService.getAll(),
        movieService.getAll().catch(() => []),
        cinemaService.getAll().catch(() => []),
      ]);

      // ✅ Create lookup maps
      const mMap = new Map(moviesData.map((m) => [m.id, m]));
      setMovieMap(mMap);

      const cMap = new Map(cinemasData.map((c) => [c.id, c]));
      setCinemaMap(cMap);

      // ✅ Create room map from cinemas
      const rMap = new Map();
      cinemasData.forEach((cinema) => {
        cinema.rooms?.forEach((room) => {
          rMap.set(room.roomId, {
            ...room,
            cinemaId: cinema.id,
            cinemaName: cinema.name,
          });
        });
      });
      setRoomMap(rMap);

      // ✅ Transform showtimes data
      const transformed = Array.isArray(showtimesData)
        ? showtimesData.flatMap((st) => {
            // Each showtime can have multiple showTimeRooms
            return (st.showTimeRooms || []).map((str, index) => {
              const room = rMap.get(str.roomId);
              const movie = mMap.get(st.movieId);
              const showTimeISO = str.showTime;

              return {
                id: `${st.showtimeId}-${index}`,
                showtimeId: st.showtimeId,
                movieId: st.movieId,
                movieTitle: movie?.title || "N/A",
                roomId: str.roomId,
                roomName: room?.roomName || "N/A",
                cinemaId: room?.cinemaId,
                cinemaName: room?.cinemaName || "N/A",
                showTimeISO: showTimeISO,
                date: showTimeISO?.split("T")[0],
                startTime: showTimeISO?.split("T")[1]?.substring(0, 5),
                status: calculateShowtimeStatus(showTimeISO),
                // Keep original data for edit
                showTimeRooms: st.showTimeRooms,
              };
            });
          })
        : [];

      console.log("✅ Transformed showtimes:", transformed.length);
      setShowtimes(transformed);
    } catch (error) {
      console.error("Error fetching showtimes:", error);
      message.error("Lỗi khi tải danh sách lịch chiếu");
      setShowtimes([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateShowtimeStatus = (showTimeISO) => {
    if (!showTimeISO) return "upcoming";

    const showDate = new Date(showTimeISO);
    const now = new Date();

    if (showDate > now) return "upcoming";

    const threeHoursLater = new Date(showDate.getTime() + 3 * 60 * 60 * 1000);
    if (now >= showDate && now <= threeHoursLater) return "active";

    return "ended";
  };

  const filterShowtimes = () => {
    let filtered = [...showtimes];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (st) =>
          st.movieTitle?.toLowerCase().includes(search) ||
          st.cinemaName?.toLowerCase().includes(search) ||
          st.roomName?.toLowerCase().includes(search)
      );
    }

    if (dateFilter) {
      filtered = filtered.filter((st) => st.date === dateFilter);
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((st) => st.status === statusFilter);
    }

    // Sort by date and time (newest first)
    filtered.sort((a, b) => {
      const dateCompare =
        new Date(b.showTimeISO || 0) - new Date(a.showTimeISO || 0);
      return dateCompare;
    });

    setFilteredShowtimes(filtered);
  };

  const handleAddShowtime = () => {
    setSelectedShowtime(null);
    setShowShowtimeForm(true);
  };

  const handleEditShowtime = (showtime) => {
    // ✅ Pass full data for editing
    setSelectedShowtime({
      ...showtime,
      showTimeRooms: [
        {
          showTime: showtime.showTimeISO,
          roomId: showtime.roomId,
        },
      ],
    });
    setShowShowtimeForm(true);
  };

  const handleDeleteShowtime = (showtime) => {
    setShowtimeToDelete(showtime);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      await showtimeService.delete(showtimeToDelete.showtimeId);
      message.success("Xóa lịch chiếu thành công!");
      fetchShowtimes(); // Reload data
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Error deleting showtime:", error);
      message.error(error.message || "Có lỗi xảy ra khi xóa lịch chiếu!");
    }
  };

  const handleSubmitShowtime = async (showtimeData) => {
    try {
      if (selectedShowtime) {
        await showtimeService.update(selectedShowtime.showtimeId, showtimeData);
        message.success("Cập nhật lịch chiếu thành công!");
      } else {
        await showtimeService.create(showtimeData);
        message.success("Tạo lịch chiếu thành công!");
      }

      setShowShowtimeForm(false);
      setSelectedShowtime(null);
      fetchShowtimes(); // Reload data
    } catch (error) {
      console.error("Error submitting showtime:", error);
      message.error(error.message || "Có lỗi xảy ra!");
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      upcoming: { label: "Sắp chiếu", className: "info" },
      active: { label: "Đang chiếu", className: "success" },
      ended: { label: "Đã kết thúc", className: "gray" },
    };

    const badge = badges[status] || badges.upcoming;
    return <span className={`badge ${badge.className}`}>{badge.label}</span>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getDateRangeStats = () => {
    const today = new Date().toISOString().split("T")[0];
    return {
      total: showtimes.length,
      today: showtimes.filter((st) => st.date === today).length,
      upcoming: showtimes.filter((st) => st.status === "upcoming").length,
      ended: showtimes.filter((st) => st.status === "ended").length,
    };
  };

  const stats = getDateRangeStats();

  if (loading) {
    return <Loading text="Đang tải lịch chiếu..." />;
  }

  return (
    <div className="admin-page">
      <Breadcrumb />

      <div className="page-header">
        <h1>Quản lý lịch chiếu</h1>
        <button onClick={handleAddShowtime} className="btn primary">
          <FiPlus size={20} />
          Tạo lịch chiếu
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-info">
              <p>Tổng lịch chiếu</p>
              <h3>{stats.total}</h3>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-info">
              <p>Hôm nay</p>
              <h3 style={{ color: "#2563eb" }}>{stats.today}</h3>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-info">
              <p>Sắp chiếu</p>
              <h3 style={{ color: "#10b981" }}>{stats.upcoming}</h3>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-info">
              <p>Đã kết thúc</p>
              <h3 style={{ color: "#6b7280" }}>{stats.ended}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="filters-bar">
        <div className="filters-content">
          <div className="search-input">
            <FiSearch size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm phim, rạp, phòng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="search-input" style={{ maxWidth: "200px" }}>
            <FiCalendar size={20} />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="upcoming">Sắp chiếu</option>
            <option value="active">Đang chiếu</option>
            <option value="ended">Đã kết thúc</option>
          </select>

          {dateFilter && (
            <button
              className="btn secondary"
              onClick={() => setDateFilter("")}
              style={{ marginLeft: "8px" }}
            >
              Xóa bộ lọc ngày
            </button>
          )}
        </div>
      </div>

      <div className="admin-table">
        {filteredShowtimes.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Phim</th>
                <th>Rạp - Phòng</th>
                <th>Ngày chiếu</th>
                <th>Giờ chiếu</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredShowtimes.map((showtime) => (
                <tr key={showtime.id}>
                  <td>
                    <strong>{showtime.movieTitle}</strong>
                  </td>
                  <td>
                    <div>
                      <p style={{ margin: 0 }}>{showtime.cinemaName}</p>
                      <small style={{ color: "#6b7280" }}>
                        {showtime.roomName}
                      </small>
                    </div>
                  </td>
                  <td>{formatDate(showtime.date)}</td>
                  <td>
                    <div className="time-cell">
                      <FiClock size={14} />
                      <span>{showtime.startTime || "N/A"}</span>
                    </div>
                  </td>
                  <td>{getStatusBadge(showtime.status)}</td>
                  <td>
                    <div className="actions">
                      <button
                        onClick={() => handleEditShowtime(showtime)}
                        className="edit"
                        title="Chỉnh sửa"
                      >
                        <FiEdit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteShowtime(showtime)}
                        className="delete"
                        title="Xóa"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty">Không tìm thấy lịch chiếu nào</div>
        )}
      </div>

      {showShowtimeForm && (
        <ShowtimeForm
          showtime={selectedShowtime}
          onClose={() => {
            setShowShowtimeForm(false);
            setSelectedShowtime(null);
          }}
          onSubmit={handleSubmitShowtime}
        />
      )}

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        title="Xác nhận xóa lịch chiếu"
        message={`Bạn có chắc chắn muốn xóa lịch chiếu "${showtimeToDelete?.movieTitle}" lúc ${showtimeToDelete?.startTime}?`}
        type="danger"
      />
    </div>
  );
};

export default Showtimes;
