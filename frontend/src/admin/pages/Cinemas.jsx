import { useState, useEffect } from "react";
import {
  FiPlus,
  FiSearch,
  FiEdit,
  FiTrash2,
  FiMapPin,
  FiGrid,
} from "react-icons/fi";
import Breadcrumb from "../components/Common/Breadcrumb";
import Loading from "../components/Common/Loading";
import ConfirmDialog from "../components/Common/ConfirmDialog";
import CinemaForm from "../components/CinemaForm";
import {
  getCinemas,
  createCinema,
  updateCinema,
  deleteCinema,
} from "../services/cinemas";
import { toast } from "react-toastify";
import "../styles/AdminLayout.scss";

const Cinemas = () => {
  const [cinemas, setCinemas] = useState([]);
  const [filteredCinemas, setFilteredCinemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [cityFilter, setCityFilter] = useState("all");

  const [showCinemaForm, setShowCinemaForm] = useState(false);
  const [selectedCinema, setSelectedCinema] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [cinemaToDelete, setCinemaToDelete] = useState(null);

  useEffect(() => {
    fetchCinemas();
  }, []);

  useEffect(() => {
    filterCinemas();
  }, [cinemas, searchTerm, cityFilter]);

  const fetchCinemas = async () => {
    try {
      setLoading(true);
      const data = await getCinemas();
      setCinemas(data.cinemas || data);
    } catch (error) {
      console.error("Error fetching cinemas:", error);
      toast.error(error.message || "Lỗi khi tải danh sách rạp");
    } finally {
      setLoading(false);
    }
  };

  const filterCinemas = () => {
    let filtered = [...cinemas];

    if (searchTerm) {
      filtered = filtered.filter(
        (cinema) =>
          cinema.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cinema.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (cityFilter !== "all") {
      filtered = filtered.filter((cinema) => cinema.city === cityFilter);
    }

    setFilteredCinemas(filtered);
  };

  const handleAddCinema = () => {
    setSelectedCinema(null);
    setShowCinemaForm(true);
  };

  const handleEditCinema = (cinema) => {
    setSelectedCinema(cinema);
    setShowCinemaForm(true);
  };

  const handleDeleteCinema = (cinema) => {
    setCinemaToDelete(cinema);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteCinema(cinemaToDelete.id);
      setCinemas((prev) => prev.filter((c) => c.id !== cinemaToDelete.id));
      toast.success("Xóa rạp thành công!");
    } catch (error) {
      console.error("Error deleting cinema:", error);
      toast.error(error.message || "Có lỗi xảy ra khi xóa rạp!");
    }
  };

  const handleSubmitCinema = async (cinemaData) => {
    try {
      if (selectedCinema) {
        const updated = await updateCinema(selectedCinema.id, cinemaData);
        setCinemas((prev) =>
          prev.map((c) => (c.id === selectedCinema.id ? updated : c))
        );
        toast.success("Cập nhật rạp thành công!");
      } else {
        const newCinema = await createCinema(cinemaData);
        setCinemas((prev) => [...prev, newCinema]);
        toast.success("Thêm rạp thành công!");
      }

      setShowCinemaForm(false);
      setSelectedCinema(null);
    } catch (error) {
      console.error("Error submitting cinema:", error);
      toast.error(error.message || "Có lỗi xảy ra!");
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: { label: "Hoạt động", className: "success" },
      inactive: { label: "Ngừng hoạt động", className: "gray" },
      maintenance: { label: "Bảo trì", className: "warning" },
    };

    const badge = badges[status] || badges.inactive;
    return <span className={`badge ${badge.className}`}>{badge.label}</span>;
  };

  const cities = ["Hà Nội", "Hồ Chí Minh", "Đà Nẵng", "Cần Thơ", "Hải Phòng"];

  if (loading) {
    return <Loading text="Đang tải danh sách rạp..." />;
  }

  return (
    <div className="admin-page">
      <Breadcrumb />

      <div className="page-header">
        <h1>Quản lý rạp chiếu</h1>
        <button onClick={handleAddCinema} className="btn primary">
          <FiPlus size={20} />
          Thêm rạp mới
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-info">
              <p>Tổng số rạp</p>
              <h3>{cinemas.length}</h3>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-info">
              <p>Đang hoạt động</p>
              <h3 style={{ color: "#10b981" }}>
                {cinemas.filter((c) => c.status === "active").length}
              </h3>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-info">
              <p>Bảo trì</p>
              <h3 style={{ color: "#f59e0b" }}>
                {cinemas.filter((c) => c.status === "maintenance").length}
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
              placeholder="Tìm kiếm rạp, địa chỉ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
          >
            <option value="all">Tất cả thành phố</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="admin-table">
        {filteredCinemas.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Tên rạp</th>
                <th>Địa chỉ</th>
                <th>Thành phố</th>
                <th>Số điện thoại</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredCinemas.map((cinema) => (
                <tr key={cinema.id}>
                  <td>
                    <strong>{cinema.name}</strong>
                  </td>
                  <td>
                    <div className="address-cell">
                      <FiMapPin size={14} />
                      <span>{cinema.address}</span>
                    </div>
                  </td>
                  <td>{cinema.city}</td>
                  <td>{cinema.phone}</td>
                  <td>{getStatusBadge(cinema.status)}</td>
                  <td>
                    <div className="actions">
                      <button className="view" title="Xem phòng chiếu">
                        <FiGrid size={18} />
                      </button>
                      <button
                        onClick={() => handleEditCinema(cinema)}
                        className="edit"
                        title="Chỉnh sửa"
                      >
                        <FiEdit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteCinema(cinema)}
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
          <div className="empty">Không tìm thấy rạp nào</div>
        )}
      </div>

      {showCinemaForm && (
        <CinemaForm
          cinema={selectedCinema}
          onClose={() => {
            setShowCinemaForm(false);
            setSelectedCinema(null);
          }}
          onSubmit={handleSubmitCinema}
        />
      )}

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        title="Xác nhận xóa rạp"
        message={`Bạn có chắc chắn muốn xóa rạp "${cinemaToDelete?.name}"? Hành động này sẽ xóa tất cả phòng chiếu và lịch chiếu liên quan.`}
        type="danger"
      />
    </div>
  );
};

export default Cinemas;
