import { FiEdit, FiTrash2, FiEye, FiCalendar } from "react-icons/fi";
import "../styles/AdminLayout.scss";

const MovieTable = ({ movies, onEdit, onDelete, onViewShowtimes }) => {
  const getStatusBadge = (status) => {
    const badges = {
      now_showing: { label: "Đang chiếu", className: "success" },
      coming_soon: { label: "Sắp chiếu", className: "info" },
      ended: { label: "Ngừng chiếu", className: "gray" },
    };

    const badge = badges[status] || badges.ended;
    return <span className={`badge ${badge.className}`}>{badge.label}</span>;
  };

  return (
    <div className="admin-table">
      <table>
        <thead>
          <tr>
            <th>Poster</th>
            <th>Tên phim</th>
            <th>Thể loại</th>
            <th>Thời lượng</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {movies.map((movie) => (
            <tr key={movie.id}>
              <td>
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="movie-poster"
                />
              </td>
              <td>
                <div className="movie-info">
                  <p className="title">{movie.title}</p>
                  <p className="director">{movie.director}</p>
                </div>
              </td>
              <td>{movie.genre}</td>
              <td>{movie.duration} phút</td>
              <td>{getStatusBadge(movie.status)}</td>
              <td>
                <div className="actions">
                  <button
                    onClick={() => onViewShowtimes(movie)}
                    className="view"
                    title="Xem lịch chiếu"
                  >
                    <FiCalendar size={18} />
                  </button>
                  <button
                    onClick={() => onEdit(movie)}
                    className="edit"
                    title="Chỉnh sửa"
                  >
                    <FiEdit size={18} />
                  </button>
                  <button
                    onClick={() => onDelete(movie)}
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
    </div>
  );
};

export default MovieTable;
