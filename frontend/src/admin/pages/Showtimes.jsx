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

  useEffect(() => {
    fetchShowtimes();
  }, []);

  useEffect(() => {
    filterShowtimes();
  }, [showtimes, searchTerm, dateFilter, statusFilter]);

  const fetchShowtimes = async () => {
    try {
      setLoading(true);
      const data = await showtimeService.getAll();

      // ✅ Pre-fetch all movies and rooms ONCE
      const [allMovies, allRooms] = await Promise.all([
        movieService.getAll().catch(() => []),
        roomService.getAll().catch(() => []),
      ]);

      console.log("📦 Pre-fetched movies:", allMovies.length);
      console.log("📦 Pre-fetched rooms:", allRooms.length);

      // ✅ Create lookup maps for faster access
      const movieMap = new Map(allMovies.map((m) => [m.id, m]));
      const roomMap = new Map(allRooms.map((r) => [r.id || r.roomId, r]));

      // ✅ Transform data using maps (no additional API calls)
      const transformed = Array.isArray(data)
        ? data.map((st) => {
            const roomId = st.showTimeRooms?.[0]?.roomId;
            const room = roomMap.get(roomId);
            const movie = movieMap.get(st.movieId);

            return {
              ...st,
              movieTitle: movie?.title || "N/A",
              roomId: roomId,
              roomName: room?.name || room?.roomName || "N/A",
              cinemaName: room?.cinemaName || "N/A",
              date: st.showTimeRooms?.[0]?.showTime?.split("T")[0],
              startTime: st.showTimeRooms?.[0]?.showTime
                ?.split("T")[1]
                ?.substring(0, 5),
              price: "(Không cố định)",
              status: calculateShowtimeStatus(st.showTimeRooms?.[0]?.showTime),
            };
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

    // Check if within 3 hours after start time
    const threeHoursLater = new Date(showDate.getTime() + 3 * 60 * 60 * 1000);
    if (now >= showDate && now <= threeHoursLater) return "active";

    return "ended";
  };

  const filterShowtimes = () => {
    let filtered = [...showtimes];

    if (searchTerm) {
      filtered = filtered.filter(
        (st) =>
          st.movieTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          st.cinemaName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          st.roomName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (dateFilter) {
      filtered = filtered.filter((st) => st.date === dateFilter);
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((st) => st.status === statusFilter);
    }

    // Sort by date and time
    filtered.sort((a, b) => {
      const dateCompare = new Date(a.date || 0) - new Date(b.date || 0);
      if (dateCompare !== 0) return dateCompare;
      return (a.startTime || "").localeCompare(b.startTime || "");
    });

    setFilteredShowtimes(filtered);
  };

  const handleAddShowtime = () => {
    setSelectedShowtime(null);
    setShowShowtimeForm(true);
  };

  const handleEditShowtime = (showtime) => {
    setSelectedShowtime(showtime);
    setShowShowtimeForm(true);
  };

  const handleDeleteShowtime = (showtime) => {
    setShowtimeToDelete(showtime);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      await showtimeService.delete(
        showtimeToDelete.showtimeId || showtimeToDelete.id
      );
      setShowtimes((prev) =>
        prev.filter((st) => st.id !== showtimeToDelete.id)
      );
      message.success("Xóa lịch chiếu thành công!");
    } catch (error) {
      console.error("Error deleting showtime:", error);
      message.error(error.message || "Có lỗi xảy ra khi xóa lịch chiếu!");
    }
  };

  const handleSubmitShowtime = async (showtimeData) => {
    try {
      if (selectedShowtime) {
        const updated = await showtimeService.update(
          selectedShowtime.showtimeId || selectedShowtime.id,
          showtimeData
        );
        setShowtimes((prev) =>
          prev.map((st) => (st.id === selectedShowtime.id ? updated : st))
        );
        message.success("Cập nhật lịch chiếu thành công!");
      } else {
        const newShowtime = await showtimeService.create(showtimeData);
        message.success("Tạo lịch chiếu thành công!");
        fetchShowtimes(); // Reload to get full data
      }

      setShowShowtimeForm(false);
      setSelectedShowtime(null);
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
      cancelled: { label: "Đã hủy", className: "danger" },
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
    const upcoming = showtimes.filter(
      (st) => st.date >= today && st.status !== "ended"
    );
    const past = showtimes.filter(
      (st) => st.date < today || st.status === "ended"
    );

    return {
      today: showtimes.filter((st) => st.date === today).length,
      upcoming: upcoming.length,
      past: past.length,
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
              <p>Hôm nay</p>
              <h3 style={{ color: "#2563eb" }}>{stats.today}</h3>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-info">
              <p>Sắp tới</p>
              <h3 style={{ color: "#10b981" }}>{stats.upcoming}</h3>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-info">
              <p>Đã qua</p>
              <h3 style={{ color: "#6b7280" }}>{stats.past}</h3>
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
            <option value="cancelled">Đã hủy</option>
          </select>
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
                <th>Giá vé</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredShowtimes.map((showtime) => (
                <tr key={showtime.showtimeId || showtime.id}>
                  <td>
                    <strong>{showtime.movieTitle || "N/A"}</strong>
                  </td>
                  <td>
                    <div>
                      <p>{showtime.cinemaName || "N/A"}</p>
                      <small style={{ color: "#6b7280" }}>
                        {showtime.roomName || "N/A"}
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
                  <td>{showtime.price?.toLocaleString() || "N/A"} VNĐ</td>
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
