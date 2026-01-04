import { useState, useEffect } from "react";
import { FiPlus, FiSearch, FiEdit, FiTrash2, FiGrid } from "react-icons/fi";
import Breadcrumb from "../components/Common/Breadcrumb";
import Loading from "../components/Common/Loading";
import ConfirmDialog from "../components/Common/ConfirmDialog";
import RoomForm from "../components/RoomForm";
import SeatEditor from "../components/SeatEditor";
import {
  getRooms,
  createRoom,
  updateRoom,
  deleteRoom,
  updateSeatLayout,
} from "../services/rooms";
import { getCinemas } from "../services/cinemas";
import { toast } from "react-toastify";
import "../styles/AdminLayout.scss";

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [cinemaFilter, setCinemaFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const [showRoomForm, setShowRoomForm] = useState(false);
  const [showSeatEditor, setShowSeatEditor] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterRooms();
  }, [rooms, searchTerm, cinemaFilter, typeFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [roomsData, cinemasData] = await Promise.all([
        getRooms(),
        getCinemas(),
      ]);
      setRooms(roomsData.rooms || roomsData);
      setCinemas(cinemasData.cinemas || cinemasData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const filterRooms = () => {
    let filtered = [...rooms];

    if (searchTerm) {
      filtered = filtered.filter((room) =>
        room.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (cinemaFilter !== "all") {
      filtered = filtered.filter(
        (room) => room.cinemaId === parseInt(cinemaFilter)
      );
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((room) => room.type === typeFilter);
    }

    setFilteredRooms(filtered);
  };

  const handleAddRoom = () => {
    setSelectedRoom(null);
    setShowRoomForm(true);
  };

  const handleEditRoom = (room) => {
    setSelectedRoom(room);
    setShowRoomForm(true);
  };

  const handleEditSeats = (room) => {
    setSelectedRoom(room);
    setShowSeatEditor(true);
  };

  const handleDeleteRoom = (room) => {
    setRoomToDelete(room);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteRoom(roomToDelete.id);
      setRooms((prev) => prev.filter((r) => r.id !== roomToDelete.id));
      toast.success("Xóa phòng thành công!");
    } catch (error) {
      console.error("Error deleting room:", error);
      toast.error(error.message || "Có lỗi xảy ra khi xóa phòng!");
    }
  };

  const handleSubmitRoom = async (roomData) => {
    try {
      if (selectedRoom) {
        const updated = await updateRoom(selectedRoom.id, roomData);
        setRooms((prev) =>
          prev.map((r) => (r.id === selectedRoom.id ? updated : r))
        );
        toast.success("Cập nhật phòng thành công!");
      } else {
        const newRoom = await createRoom(roomData);
        setRooms((prev) => [...prev, newRoom]);
        toast.success("Thêm phòng thành công!");
      }

      setShowRoomForm(false);
      setSelectedRoom(null);
    } catch (error) {
      console.error("Error submitting room:", error);
      toast.error(error.message || "Có lỗi xảy ra!");
    }
  };

  const handleSaveSeatLayout = async (seatData) => {
    try {
      await updateSeatLayout(seatData.roomId, seatData);
      toast.success("Lưu sơ đồ ghế thành công!");
      setShowSeatEditor(false);
      setSelectedRoom(null);
      fetchData();
    } catch (error) {
      console.error("Error saving seat layout:", error);
      toast.error(error.message || "Có lỗi xảy ra khi lưu sơ đồ ghế!");
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

  const getCinemaName = (cinemaId) => {
    const cinema = cinemas.find((c) => String(c.id) === String(cinemaId));
    return cinema?.name || "N/A";
  };

  const roomTypes = ["2D", "3D", "IMAX", "4DX", "ScreenX"];

  if (loading) {
    return <Loading text="Đang tải danh sách phòng..." />;
  }

  return (
    <div className="admin-page">
      <Breadcrumb />

      <div className="page-header">
        <h1>Quản lý phòng chiếu</h1>
        <button onClick={handleAddRoom} className="btn primary">
          <FiPlus size={20} />
          Thêm phòng mới
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-info">
              <p>Tổng số phòng</p>
              <h3>{rooms.length}</h3>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-info">
              <p>Đang hoạt động</p>
              <h3 style={{ color: "#10b981" }}>
                {rooms.filter((r) => r.status === "active").length}
              </h3>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-info">
              <p>Tổng sức chứa</p>
              <h3 style={{ color: "#2563eb" }}>
                {rooms.reduce((sum, r) => sum + (r.capacity || 0), 0)}
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
              placeholder="Tìm kiếm phòng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            value={cinemaFilter}
            onChange={(e) => setCinemaFilter(e.target.value)}
          >
            <option value="all">Tất cả rạp</option>
            {cinemas.map((cinema) => (
              <option key={cinema.id} value={cinema.id}>
                {cinema.name}
              </option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">Tất cả loại</option>
            {roomTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="admin-table">
        {filteredRooms.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Tên phòng</th>
                <th>Rạp chiếu</th>
                <th>Loại</th>
                <th>Sức chứa</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredRooms.map((room) => (
                <tr key={room.id}>
                  <td>
                    <strong>{room.name}</strong>
                  </td>
                  <td>{getCinemaName(room.cinemaId)}</td>
                  <td>
                    <span className="badge info">{room.type}</span>
                  </td>
                  <td>{room.capacity} ghế</td>
                  <td>{getStatusBadge(room.status)}</td>
                  <td>
                    <div className="actions">
                      <button
                        onClick={() => handleEditSeats(room)}
                        className="view"
                        title="Sơ đồ ghế"
                      >
                        <FiGrid size={18} />
                      </button>
                      <button
                        onClick={() => handleEditRoom(room)}
                        className="edit"
                        title="Chỉnh sửa"
                      >
                        <FiEdit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteRoom(room)}
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
          <div className="empty">Không tìm thấy phòng nào</div>
        )}
      </div>

      {showRoomForm && (
        <RoomForm
          room={selectedRoom}
          onClose={() => {
            setShowRoomForm(false);
            setSelectedRoom(null);
          }}
          onSubmit={handleSubmitRoom}
        />
      )}

      {showSeatEditor && (
        <SeatEditor
          room={selectedRoom}
          onClose={() => {
            setShowSeatEditor(false);
            setSelectedRoom(null);
          }}
          onSave={handleSaveSeatLayout}
        />
      )}

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        title="Xác nhận xóa phòng"
        message={`Bạn có chắc chắn muốn xóa phòng "${roomToDelete?.name}"? Hành động này sẽ xóa tất cả lịch chiếu liên quan.`}
        type="danger"
      />
    </div>
  );
};

export default Rooms;
