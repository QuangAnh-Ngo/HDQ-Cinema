// frontend/src/admin/pages/Bookings.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import {
  FiSearch,
  FiEye,
  FiAlertCircle,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import Breadcrumb from "../components/Common/Breadcrumb";
import Loading from "../components/Common/Loading";
import { bookingService } from "../../services";
import { message } from "antd";
import "../styles/AdminLayout.scss";

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(true);

  // Filter params - gửi lên server
  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 50;

  // Ref để track nếu cần fetch lại (tránh double fetch)
  const shouldFetch = useRef(true);

  // Status options cho dropdown
  const statusOptions = [
    { value: "", label: "Tất cả trạng thái" },
    { value: "PENDING", label: "Chờ thanh toán" },
    { value: "CONFIRM", label: "Đã xác nhận" },
    { value: "CANCELLED", label: "Đã hủy" },
  ];

  // Hàm fetch bookings từ server với filter/sort
  const fetchBookings = useCallback(async (page, keyword, status) => {
    // 🔍 DEBUG: Log function call
    console.log("🔄 [Bookings] fetchBookings called with:", { page, keyword, status });

    try {
      setLoading(true);

      const params = {
        page: page,
        size: pageSize,
        keyword: keyword || null,
        status: status || null,
        sortBy: "id",
        sortDir: "desc",
      };

      console.log("🔄 [Bookings] Calling bookingService.getPaged with params:", params);

      const response = await bookingService.getPaged(params);

      // 🔍 DEBUG: Log response received
      console.log("✅ [Bookings] Response received:", response);

      if (response) {
        // 🔍 DEBUG: Check data structure
        console.log("📊 [Bookings] Setting bookings:", response.data);
        console.log("📊 [Bookings] Data length:", response.data?.length);

        setBookings(response.data || []);
        setTotalPages(response.totalPages || 0);
        setTotalElements(response.totalElements || 0);

        // Calculate stats from response
        const today = new Date().toISOString().split("T")[0];
        console.log("📅 [Bookings] Today date for stats:", today);

        const bookingsData = response.data || [];

        // 🔍 DEBUG: Check bookingStatus field
        if (bookingsData.length > 0) {
          console.log("🔍 [Bookings] First booking bookingStatus:", bookingsData[0].bookingStatus);
          console.log("🔍 [Bookings] First booking all fields:", bookingsData[0]);
        }

        const pendingCount = bookingsData.filter((b) => b.bookingStatus === "PENDING").length;
        console.log("📊 [Bookings] Pending count calculated:", pendingCount);

        setStats({
          totalBookings: response.totalElements || 0,
          todayRevenue: bookingsData
            .filter((b) => b.createTime?.startsWith(today))
            .reduce((sum, b) => sum + (b.totalPrice || 0), 0),
          pendingCount: pendingCount,
        });
      } else {
        console.warn("⚠️ [Bookings] Response is null/undefined");
        setBookings([]);
        setStats({ totalBookings: 0, todayRevenue: 0, pendingCount: 0 });
      }
    } catch (error) {
      // 🔍 DEBUG: Log error details
      console.error("❌ [Bookings] Error fetching bookings:", error);
      console.error("❌ [Bookings] Error type:", typeof error);
      console.error("❌ [Bookings] Error status:", error?.status);
      console.error("❌ [Bookings] Error response:", error?.response);

      if (error.status === 403) {
        setHasPermission(false);
        message.error({
          content: "Không có quyền truy cập. Vui lòng đăng nhập với tài khoản có quyền.",
          duration: 5,
        });
      } else {
        message.error("Lỗi khi tải dữ liệu");
      }

      setBookings([]);
      setStats({ totalBookings: 0, todayRevenue: 0, pendingCount: 0 });
    } finally {
      setLoading(false);
      console.log("🏁 [Bookings] fetchBookings completed");
    }
  }, [pageSize]);

  // Fetch khi component mount
  useEffect(() => {
    console.log("🔄 [Bookings] Initial useEffect - mounting component");
    fetchBookings(0, "", "");
  }, [fetchBookings]);

  // Fetch khi đổi trang (không phải lần đầu)
  useEffect(() => {
    // Skip initial render
    if (!shouldFetch.current) {
      shouldFetch.current = true;
      return;
    }

    console.log("🔄 [Bookings] Page change useEffect - currentPage:", currentPage);
    // Khi đổi trang, fetch với keyword và status hiện tại
    fetchBookings(currentPage, searchKeyword, statusFilter);
  }, [currentPage]); // eslint-disable-line react-hooks/exhaustive-deps

  // Xử lý tìm kiếm - reset về trang đầu và fetch lại
  const handleSearch = () => {
    console.log("🔍 [Bookings] handleSearch - keyword:", searchKeyword, "status:", statusFilter);
    // Luôn fetch với giá trị mới, reset về trang 0
    setCurrentPage(0);
    shouldFetch.current = false; // Prevent double fetch from useEffect
    fetchBookings(0, searchKeyword, statusFilter);
  };

  // Xử lý khi nhấn Enter trong ô tìm kiếm
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Xử lý thay đổi status filter
  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    console.log("🔄 [Bookings] handleStatusChange - newStatus:", newStatus);
    setStatusFilter(newStatus);
    setCurrentPage(0);
    shouldFetch.current = false; // Prevent double fetch from useEffect
    fetchBookings(0, searchKeyword, newStatus);
  };

  // Pagination handlers
  const handlePrevPage = () => {
    if (currentPage > 0) {
      console.log("⬅️ [Bookings] handlePrevPage - going to page:", currentPage - 1);
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      console.log("➡️ [Bookings] handleNextPage - going to page:", currentPage + 1);
      setCurrentPage(currentPage + 1);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "CONFIRM":
        return <span className="badge success">Đã xác nhận</span>;
      case "PENDING":
        return <span className="badge warning">Chờ thanh toán</span>;
      case "CANCELLED":
        return <span className="badge danger">Đã hủy</span>;
      default:
        return <span className="badge gray">{status}</span>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading && bookings.length === 0) {
    return <Loading text="Đang tải danh sách đặt vé..." />;
  }

  return (
    <div className="admin-page">
      <Breadcrumb />

      <div className="page-header">
        <h1>Quản lý đặt vé</h1>
      </div>

      {/* Permission warning */}
      {!hasPermission && (
        <div className="alert warning" style={{ marginBottom: 24 }}>
          <FiAlertCircle size={20} />
          <div>
            <strong>Không có quyền truy cập</strong>
            <p>
              Tính năng này yêu cầu đăng nhập với tài khoản có quyền MANAGE_BOOKING.
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-info">
              <p>Tổng đặt vé</p>
              <h3>{stats?.totalBookings || 0}</h3>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-info">
              <p>Doanh thu hôm nay</p>
              <h3 style={{ color: "#10b981" }}>
                {(stats?.todayRevenue || 0).toLocaleString()}đ
              </h3>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-info">
              <p>Chờ thanh toán</p>
              <h3 style={{ color: "#f59e0b" }}>{stats?.pendingCount || 0}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Filters - Server-side */}
      <div className="filters-bar">
        <div className="filters-content">
          <div className="search-input">
            <FiSearch size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm mã booking, tên, email..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button className="btn-primary" onClick={handleSearch} style={{ marginLeft: 8 }}>
              Tìm kiếm
            </button>
          </div>

          <select
            value={statusFilter}
            onChange={handleStatusChange}
            className="filter-select"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="admin-table">
        {loading ? (
          <Loading text="Đang tải..." />
        ) : bookings.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Mã booking</th>
                <th>Khách hàng</th>
                <th>Trạng thái</th>
                <th>Suất chiếu</th>
                <th>Ghế</th>
                <th>Tổng tiền</th>
                <th>Thời gian đặt</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td>
                    <strong className="booking-code">{booking.id}</strong>
                  </td>
                  <td>{booking.username || "N/A"}</td>
                  <td>{getStatusBadge(booking.bookingStatus)}</td>
                  <td>{formatDate(booking.showTime)}</td>
                  <td>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {booking.seats?.slice(0, 3).map((seat, idx) => (
                        <span key={idx} className="badge info">
                          {seat}
                        </span>
                      ))}
                      {booking.seats?.length > 3 && (
                        <span className="badge gray">
                          +{booking.seats.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <strong>
                      {booking.totalPrice?.toLocaleString() || 0}đ
                    </strong>
                  </td>
                  <td>{formatDate(booking.createTime)}</td>
                  <td>
                    <div className="actions">
                      <button className="view" title="Xem chi tiết">
                        <FiEye size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty">
            {!hasPermission
              ? "Không có quyền xem booking. Vui lòng đăng nhập với tài khoản có quyền."
              : "Không tìm thấy booking nào"}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={handlePrevPage}
            disabled={currentPage === 0}
          >
            <FiChevronLeft size={18} />
            Trước
          </button>

          <span className="pagination-info">
            Trang {currentPage + 1} / {totalPages} (Tổng: {totalElements} booking)
          </span>

          <button
            className="pagination-btn"
            onClick={handleNextPage}
            disabled={currentPage >= totalPages - 1}
          >
            Sau
            <FiChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default Bookings;
