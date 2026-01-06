// frontend/src/user/components/MovieFilter/MovieFilter.jsx
import { useState } from "react";
import { Select, Button, Tag } from "antd";
import { FilterOutlined, CloseCircleOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";
import "./MovieFilter.scss";

const MovieFilter = ({ onFilterChange, totalMovies }) => {
  const [filters, setFilters] = useState({
    genre: "all",
    ageRating: "all",
    sortBy: "latest",
  });

  const [isExpanded, setIsExpanded] = useState(false);

  // ✅ Danh sách thể loại phổ biến
  const genres = [
    { value: "all", label: "Tất cả thể loại" },
    { value: "Hành động", label: "Hành động" },
    { value: "Hài", label: "Hài hước" },
    { value: "Kinh dị", label: "Kinh dị" },
    { value: "Tình cảm", label: "Tình cảm" },
    { value: "Viễn tưởng", label: "Viễn tưởng" },
    { value: "Phiêu lưu", label: "Phiêu lưu" },
    { value: "Hoạt hình", label: "Hoạt hình" },
    { value: "Tâm lý", label: "Tâm lý" },
    { value: "Khoa học", label: "Khoa học" },
  ];

  // ✅ Độ tuổi
  const ageRatings = [
    { value: "all", label: "Tất cả độ tuổi" },
    { value: "P", label: "P - Phổ thông" },
    { value: "13", label: "T13 - 13+" },
    { value: "16", label: "T16 - 16+" },
    { value: "18", label: "T18 - 18+" },
  ];

  // ✅ Sắp xếp
  const sortOptions = [
    { value: "latest", label: "Mới nhất" },
    { value: "name-asc", label: "Tên phim (A-Z)" },
    { value: "name-desc", label: "Tên phim (Z-A)" },
    { value: "duration-asc", label: "Thời lượng tăng dần" },
    { value: "duration-desc", label: "Thời lượng giảm dần" },
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      genre: "all",
      ageRating: "all",
      sortBy: "latest",
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  const hasActiveFilters =
    filters.genre !== "all" ||
    filters.ageRating !== "all" ||
    filters.sortBy !== "latest";

  return (
    <div className="movie-filter-container">
      <div className="filter-header">
        <div className="filter-title">
          <FilterOutlined className="filter-icon" />
          <span>Lọc phim</span>
          {totalMovies > 0 && (
            <Tag color="blue" className="movie-count">
              {totalMovies} phim
            </Tag>
          )}
        </div>

        <Button
          type="text"
          size="small"
          className="toggle-btn"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? "Thu gọn" : "Mở rộng"}
        </Button>
      </div>

      <div className={`filter-content ${isExpanded ? "expanded" : ""}`}>
        <div className="filter-row">
          {/* Thể loại */}
          <div className="filter-item">
            <label>Thể loại</label>
            <Select
              value={filters.genre}
              onChange={(value) => handleFilterChange("genre", value)}
              options={genres}
              className="filter-select"
              placeholder="Chọn thể loại"
            />
          </div>

          {/* Độ tuổi */}
          <div className="filter-item">
            <label>Độ tuổi</label>
            <Select
              value={filters.ageRating}
              onChange={(value) => handleFilterChange("ageRating", value)}
              options={ageRatings}
              className="filter-select"
              placeholder="Chọn độ tuổi"
            />
          </div>

          {/* Sắp xếp */}
          <div className="filter-item">
            <label>Sắp xếp</label>
            <Select
              value={filters.sortBy}
              onChange={(value) => handleFilterChange("sortBy", value)}
              options={sortOptions}
              className="filter-select"
              placeholder="Chọn cách sắp xếp"
            />
          </div>

          {/* Reset button */}
          {hasActiveFilters && (
            <div className="filter-item">
              <label>&nbsp;</label>
              <Button
                danger
                icon={<CloseCircleOutlined />}
                onClick={handleReset}
                className="reset-btn"
              >
                Xóa bộ lọc
              </Button>
            </div>
          )}
        </div>

        {/* Active filters tags */}
        {hasActiveFilters && (
          <div className="active-filters">
            <span className="active-filters-label">Đang lọc:</span>
            {filters.genre !== "all" && (
              <Tag
                closable
                onClose={() => handleFilterChange("genre", "all")}
                color="purple"
              >
                {genres.find((g) => g.value === filters.genre)?.label}
              </Tag>
            )}
            {filters.ageRating !== "all" && (
              <Tag
                closable
                onClose={() => handleFilterChange("ageRating", "all")}
                color="red"
              >
                {ageRatings.find((a) => a.value === filters.ageRating)?.label}
              </Tag>
            )}
            {filters.sortBy !== "latest" && (
              <Tag
                closable
                onClose={() => handleFilterChange("sortBy", "latest")}
                color="blue"
              >
                {sortOptions.find((s) => s.value === filters.sortBy)?.label}
              </Tag>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

MovieFilter.propTypes = {
  onFilterChange: PropTypes.func.isRequired,
  totalMovies: PropTypes.number,
};

export default MovieFilter;
