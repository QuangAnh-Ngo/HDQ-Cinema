// frontend/src/admin/pages/Rooms.jsx
import { useState, useEffect } from "react";
import {
  FiPlus,
  FiSearch,
  FiEdit,
  FiTrash2,
  FiGrid,
  FiAlertCircle,
} from "react-icons/fi";
import Breadcrumb from "../components/Common/Breadcrumb";
import Loading from "../components/Common/Loading";
import ConfirmDialog from "../components/Common/ConfirmDialog";
import RoomForm from "../components/RoomForm";
import { roomService, cinemaService } from "../../services";
import { message } from "antd";
import "../styles/AdminLayout.scss";

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [cinemaFilter, setCinemaFilter] = useState("all");

  const [showRoomForm, setShowRoomForm] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterRooms();
  }, [rooms, searchTerm, cinemaFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [roomsData, cinemasData] = await Promise.all([
        roomService.getAll(),
        cinemaService.getAll(),
      ]);

      setRooms(Array.isArray(roomsData) ? roomsData : []);
      setCinemas(Array.isArray(cinemasData) ? cinemasData : []);
    } catch (error) {
      console.error("Error fetching data:", error);
      message.error("Lỗi khi tải dữ liệu");
      setRooms([]);
      setCinemas([]);
    } finally {
      setLoading(false);
    }
  };

  const filterRooms = () => {
    let filtered = [...rooms];

    if (searchTerm) {
      filtered = filtered.filter((room) =>
        (room.roomName || room.name)
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    }

    if (cinemaFilter !== "all") {
      filtered = filtered.filter(
        (room) => String(room.cinemaId) === String(cinemaFilter)
      );
    }

    setFilteredRooms(filtered);
  };

  const handleAddRoom = () => {
    setSelectedRoom(null);
    setShowRoomForm(true);
  };

  // ✅ Hiển thị thông báo đang phát triển
  const handleEditRoom = (room) => {
    message.warning("Chức năng chỉnh sửa phòng đang được phát triển");
  };

  const handleEditSeats = (room) => {
    message.warning("Chức năng quản lý sơ đồ ghế đang được phát triển");
  };

  const handleDeleteRoom = (room) => {
    message.warning("Chức năng xóa phòng đang được phát triển");
  };

  const handleSubmitRoom = async (roomData) => {
    try {
      if (selectedRoom) {
        message.warning("Chức năng chỉnh sửa phòng đang được phát triển");
        return;
      }

      await roomService.create(roomData);
      message.success("Thêm phòng thành công!");

      // Clear cache và reload
      roomService.clearCache();
      fetchData();

      setShowRoomForm(false);
      setSelectedRoom(null);
    } catch (error) {
      console.error("Error submitting room:", error);
      message.error(error.message || "Có lỗi xảy ra!");
    }
  };

  const getCinemaName = (cinemaId) => {
    const cinema = cinemas.find((c) => String(c.id) === String(cinemaId));
    return cinema?.name || "N/A";
  };

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

      {/* ✅ Thông báo API hạn chế */}
      <div className="page-notice">
        <FiAlertCircle size={18} />
        <span>
          Một số chức năng (Sửa, Xóa, Sơ đồ ghế) đang được phát triển.
        </span>
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
              <p>Số rạp</p>
              <h3 style={{ color: "#10b981" }}>{cinemas.length}</h3>
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
        </div>
      </div>

      <div className="admin-table">
        {filteredRooms.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên phòng</th>
                <th>Rạp chiếu</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredRooms.map((room) => (
                <tr key={room.roomId || room.id}>
                  <td>{room.roomId || room.id}</td>
                  <td>
                    <strong>{room.roomName || room.name}</strong>
                  </td>
                  <td>{room.cinemaName || getCinemaName(room.cinemaId)}</td>
                  <td>
                    <div className="actions">
                      <button
                        onClick={() => handleEditSeats(room)}
                        className="view disabled"
                        title="Sơ đồ ghế (Đang phát triển)"
                      >
                        <FiGrid size={18} />
                      </button>
                      <button
                        onClick={() => handleEditRoom(room)}
                        className="edit disabled"
                        title="Chỉnh sửa (Đang phát triển)"
                      >
                        <FiEdit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteRoom(room)}
                        className="delete disabled"
                        title="Xóa (Đang phát triển)"
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
          cinemas={cinemas}
          onClose={() => {
            setShowRoomForm(false);
            setSelectedRoom(null);
          }}
          onSubmit={handleSubmitRoom}
        />
      )}

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={() => {
          message.warning("Chức năng xóa phòng đang được phát triển");
          setShowDeleteDialog(false);
        }}
        title="Xác nhận xóa phòng"
        message={`Bạn có chắc chắn muốn xóa phòng "${
          roomToDelete?.roomName || roomToDelete?.name
        }"?`}
        type="danger"
      />
    </div>
  );
};

export default Rooms;
