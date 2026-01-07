// frontend/src/admin/pages/Showtimes.jsx
import { useState, useEffect } from "react";
import {
  FiPlus,
  FiSearch,
  FiEdit,
  FiTrash2,
  FiClock,
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import Breadcrumb from "../components/Common/Breadcrumb";
import Loading from "../components/Common/Loading";
import ConfirmDialog from "../components/Common/ConfirmDialog";
import ShowtimeForm from "../components/ShowtimeForm";
import {
  showtimeService,
  movieService,
  cinemaService,
} from "../../services";
import { message } from "antd";
import "../styles/AdminLayout.scss";

const Showtimes = () => {
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 50;

  const [showShowtimeForm, setShowShowtimeForm] = useState(false);
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showtimeToDelete, setShowtimeToDelete] = useState(null);

  // Store for form dropdowns
  const [movies, setMovies] = useState([]);
  const [cinemas, setCinemas] = useState([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchShowtimes();
  }, [currentPage, searchTerm]);

  // Fetch movies and cinemas once for form dropdowns
  const fetchInitialData = async () => {
    try {
      const [moviesData, cinemasData] = await Promise.all([
        movieService.getAll().catch(() => []),
        cinemaService.getAll().catch(() => []),
      ]);
      setMovies(moviesData);
      setCinemas(cinemasData);
    } catch (error) {
      console.error("Error fetching initial data:", error);
    }
  };

  // ✅ SỬA: Sử dụng API phân trang thay vì getAll()
  const fetchShowtimes = async () => {
    try {
      setLoading(true);

      // Gọi API phân trang
      const response = await showtimeService.getPaged(
        currentPage,
        pageSize,
        searchTerm,
        "startTime",
        "desc"
      );

      // Transform data
      const transformed = (response.data || []).map((st) => ({
        id: st.showtimeId,
        showtimeId: st.showtimeId,
        movieId: st.movieId,
        movieTitle: st.movieTitle || "N/A",
        roomId: st.roomId,
        roomName: st.roomName || "N/A",
        cinemaId: st.cinemaId,
        cinemaName: st.cinemaName || "N/A",
        showTimeISO: st.startTime,
        date: st.startTime?.split("T")[0],
        startTime: st.startTime?.split("T")[1]?.substring(0, 5),
        status: calculateShowtimeStatus(st.startTime),
      }));

      setShowtimes(transformed);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
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

  // ✅ Filter locally cho dateFilter và statusFilter (vì đã có data từ server)
  const filteredShowtimes = showtimes.filter((st) => {
    let matches = true;

    if (dateFilter) {
      matches = matches && st.date === dateFilter;
    }

    if (statusFilter !== "all") {
      matches = matches && st.status === statusFilter;
    }

    return matches;
  });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(0); // Reset to first page when search changes
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleAddShowtime = () => {
    setSelectedShowtime(null);
    setShowShowtimeForm(true);
  };

  const handleEditShowtime = (showtime) => {
    setSelectedShowtime({
      showtimeId: showtime.showtimeId,
      movieId: showtime.movieId,
      roomId: showtime.roomId,
      cinemaId: showtime.cinemaId,
      showTime: showtime.showTimeISO,
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
      fetchShowtimes();
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
      fetchShowtimes();
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

  // Pagination handlers
  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (loading && showtimes.length === 0) {
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
              <h3>{totalElements}</h3>
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
        {loading ? (
          <div className="loading-overlay">
            <Loading text="Đang tải..." />
          </div>
        ) : filteredShowtimes.length > 0 ? (
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

        {/* ✅ Pagination Controls */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 0}
              className="btn secondary"
            >
              <FiChevronLeft size={18} />
              Trước
            </button>
            <span className="page-info">
              Trang {currentPage + 1} / {totalPages} ({totalElements} bản ghi)
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage >= totalPages - 1}
              className="btn secondary"
            >
              Sau
              <FiChevronRight size={18} />
            </button>
          </div>
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
