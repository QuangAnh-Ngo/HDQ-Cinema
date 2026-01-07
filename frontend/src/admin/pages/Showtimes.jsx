import { useState, useEffect, useCallback } from "react";
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
import { showtimeService } from "../../services";
import { message, Select } from "antd";
import "../styles/AdminLayout.scss";

const Showtimes = () => {
  const [pageData, setPageData] = useState({
    content: [],
    pageNumber: 0,
    pageSize: 20,
    totalElements: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, upcoming: 0, today: 0 });

  const [filters, setFilters] = useState({
    search: "",
    dateFrom: "",
    dateTo: "",
    status: "all",
    page: 0,
    size: 20,
    sortBy: "startTime",
    sortDir: "asc",
  });

  const [showShowtimeForm, setShowShowtimeForm] = useState(false);
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showtimeToDelete, setShowtimeToDelete] = useState(null);

  const fetchShowtimes = useCallback(async () => {
    try {
      setLoading(true);

      const [searchResult, statsResult] = await Promise.all([
        showtimeService.search(filters),
        showtimeService.getStatistics(),
      ]);

      setPageData(searchResult);
      setStats(statsResult);
    } catch (error) {
      console.error("Error fetching showtimes:", error);
      message.error("Lỗi khi tải danh sách lịch chiếu");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchShowtimes();
    }, 300); // Debounce 300ms for search

    return () => clearTimeout(debounce);
  }, [fetchShowtimes]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 0, // Reset to first page when filter changes
    }));
  };

  // ✅ Handle pagination
  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handlePageSizeChange = (newSize) => {
    setFilters((prev) => ({ ...prev, size: newSize, page: 0 }));
  };

  const handleAddShowtime = () => {
    setSelectedShowtime(null);
    setShowShowtimeForm(true);
  };

  const handleEditShowtime = (showtime) => {
    setSelectedShowtime({
      ...showtime,
      showTimeRooms: [
        {
          showTime: showtime.startTime,
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

  if (loading && pageData.content.length === 0) {
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

      {/* ✅ Stats from backend */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-info">
              <p>Tổng lịch chiếu</p>
              <h3>{stats.total?.toLocaleString()}</h3>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-info">
              <p>Hôm nay</p>
              <h3 style={{ color: "#2563eb" }}>
                {stats.today?.toLocaleString()}
              </h3>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-info">
              <p>Sắp chiếu</p>
              <h3 style={{ color: "#10b981" }}>
                {stats.upcoming?.toLocaleString()}
              </h3>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-info">
              <p>Trang hiện tại</p>
              <h3>
                {pageData.pageNumber + 1} / {pageData.totalPages}
              </h3>
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
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
            />
          </div>

          <div className="search-input" style={{ maxWidth: "180px" }}>
            <FiCalendar size={20} />
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
              placeholder="Từ ngày"
            />
          </div>

          <div className="search-input" style={{ maxWidth: "180px" }}>
            <FiCalendar size={20} />
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange("dateTo", e.target.value)}
              placeholder="Đến ngày"
            />
          </div>

          <select
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="upcoming">Sắp chiếu</option>
            <option value="active">Đang chiếu</option>
            <option value="ended">Đã kết thúc</option>
          </select>

          {(filters.search ||
            filters.dateFrom ||
            filters.dateTo ||
            filters.status !== "all") && (
            <button
              className="btn secondary"
              onClick={() =>
                setFilters({
                  ...filters,
                  search: "",
                  dateFrom: "",
                  dateTo: "",
                  status: "all",
                  page: 0,
                })
              }
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      </div>

      <div className="admin-table">
        {loading && <div className="table-loading">Đang tải...</div>}

        {pageData.content.length > 0 ? (
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
              {pageData.content.map((showtime) => (
                <tr key={showtime.showtimeId}>
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
                      <span>{showtime.time || "N/A"}</span>
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

      {pageData.totalPages > 1 && (
        <div
          className="pagination"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px",
            marginTop: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span>Hiển thị</span>
            <Select
              value={filters.size}
              onChange={handlePageSizeChange}
              style={{ width: 80 }}
              options={[
                { value: 10, label: "10" },
                { value: 20, label: "20" },
                { value: 50, label: "50" },
                { value: 100, label: "100" },
              ]}
            />
            <span>/ {pageData.totalElements.toLocaleString()} kết quả</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              className="btn secondary"
              disabled={pageData.first}
              onClick={() => handlePageChange(pageData.pageNumber - 1)}
            >
              <FiChevronLeft />
            </button>

            <span style={{ padding: "0 16px" }}>
              Trang {pageData.pageNumber + 1} / {pageData.totalPages}
            </span>

            <button
              className="btn secondary"
              disabled={pageData.last}
              onClick={() => handlePageChange(pageData.pageNumber + 1)}
            >
              <FiChevronRight />
            </button>
          </div>
        </div>
      )}

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
        message={`Bạn có chắc chắn muốn xóa lịch chiếu "${showtimeToDelete?.movieTitle}" lúc ${showtimeToDelete?.time}?`}
        type="danger"
      />
    </div>
  );
};

export default Showtimes;
