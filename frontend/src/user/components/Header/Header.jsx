import {
  Layout,
  Cascader,
  Button,
  Input,
  Spin,
  List,
  Dropdown,
  Avatar,
} from "antd";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  SearchOutlined,
  CloseCircleFilled,
  UserOutlined,
  LogoutOutlined,
  HistoryOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { useEffect, useState, useMemo } from "react";
import { cinemaService, movieService, authService } from "../../../services";
import logo from "../../../assets/images/HDQ-Cinema-logo.png";
import "./Header.scss";

const { Header: AntHeader } = Layout;

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [cinemas, setCinemas] = useState([]);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Lấy danh sách rạp khi component mount
  useEffect(() => {
    const fetchCinemas = async () => {
      try {
        const data = await cinemaService.getAll();
        setCinemas(data);
      } catch (error) {
        console.error("Error fetching cinemas:", error);
      }
    };
    fetchCinemas();
  }, []);

  // Theo dõi trạng thái đăng nhập mỗi khi đường dẫn thay đổi
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, [location.pathname]);

  /**
   * Nhóm rạp theo Thành phố -> Quận/Huyện -> Tên Rạp
   */
  const cascaderOptions = useMemo(() => {
    const options = [];
    cinemas.forEach((cinema) => {
      // Tìm hoặc tạo Thành phố
      let city = options.find((o) => o.value === cinema.city);
      if (!city) {
        city = { value: cinema.city, label: cinema.city, children: [] };
        options.push(city);
      }

      // Tìm hoặc tạo Quận/Huyện
      let district = city.children.find((o) => o.value === cinema.district);
      if (!district) {
        district = {
          value: cinema.district,
          label: cinema.district,
          children: [],
        };
        city.children.push(district);
      }

      // Thêm Rạp (Backend dùng 'id')
      district.children.push({
        value: cinema.id,
        label: cinema.name,
      });
    });
    return options;
  }, [cinemas]);

  const handleCinemaChange = (value) => {
    if (!value || value.length === 0) return;

    const cinemaId = value[value.length - 1]; // ← Lấy cinema ID
    console.log("Cinema selected:", cinemaId);

    localStorage.setItem("selectedCinemaId", cinemaId);

    navigate("/", {
      state: {
        cinemaId: cinemaId,
      },
    });
  };

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
    navigate("/login");
  };

  // Logic Tìm kiếm với Debounce (chờ 500ms sau khi ngừng gõ mới gọi API)
  useEffect(() => {
    if (searchTerm.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const movies = await movieService.getAll();
        const filtered = movies.filter((movie) =>
          movie.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setSearchResults(filtered);
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const userMenuItems = [
    {
      key: "history",
      label: "Lịch sử đặt vé",
      icon: <HistoryOutlined />,
      onClick: () => navigate("/members/my-info"),
    },
    { type: "divider" },
    {
      key: "logout",
      label: "Đăng xuất",
      icon: <LogoutOutlined />,
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <AntHeader className="header">
      <div className="header-container">
        <div className="wrap">
          {/* Logo */}
          <div className="logo">
            <Link to="/" state={{ cinemaId: location.state?.cinemaId }}>
              <img src={logo} alt="HDQ Cinema Logo" />
            </Link>
          </div>

          {/* Cinema Selector */}
          <Cascader
            options={cascaderOptions}
            onChange={handleCinemaChange}
            placeholder={
              <span>
                <EnvironmentOutlined /> Chọn rạp
              </span>
            }
            className="cinema-cascader"
            displayRender={(labels) => labels[labels.length - 1]}
            expandTrigger="hover"
          />

          {/* Search Box */}
          <div className="header-search">
            <Input
              placeholder="Tìm phim..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              prefix={<SearchOutlined />}
              className="rounded-full"
              suffix={
                searchTerm && (
                  <CloseCircleFilled
                    onClick={() => setSearchTerm("")}
                    className="cursor-pointer text-gray-400 hover:text-white"
                  />
                )
              }
            />

            {/* Dropdown kết quả tìm kiếm */}
            {searchTerm && (
              <div className="search-dropdown">
                <div className="search-header">Kết quả tìm kiếm</div>
                {searchLoading ? (
                  <div className="search-loading">
                    <Spin size="small" />
                  </div>
                ) : searchResults.length > 0 ? (
                  <List
                    dataSource={searchResults}
                    renderItem={(movie) => (
                      <List.Item
                        key={movie.id}
                        onClick={() => {
                          const currentCinemaId =
                            localStorage.getItem("selectedCinemaId");
                          navigate(`/movie-detail/${movie.id}`, {
                            state: { cinemaId: currentCinemaId },
                          });
                          setSearchTerm("");
                        }}
                        className="search-item"
                      >
                        <img
                          src={movie.poster}
                          alt={movie.title}
                          className="movie-poster"
                        />
                        <div className="movie-info">
                          <div className="movie-title">{movie.title}</div>
                          <div className="movie-meta">
                            <span className="movie-rating">
                              T{movie.limitAge}
                            </span>
                            <span className="movie-duration">
                              {movie.duration} phút
                            </span>
                          </div>
                        </div>
                      </List.Item>
                    )}
                  />
                ) : (
                  <div className="no-results text-white/50 py-4">
                    Không tìm thấy phim phù hợp
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Section */}
          <div className="user-section">
            {user ? (
              <Dropdown
                menu={{ items: userMenuItems }}
                trigger={["click"]}
                placement="bottomRight"
              >
                <Button
                  type="text"
                  className="user-menu-btn flex items-center gap-2 text-white"
                >
                  <Avatar
                    size="small"
                    icon={<UserOutlined />}
                    className="bg-[#8864f0]"
                  />
                  <span className="username hidden sm:inline">
                    {user.lastName || user.username}
                  </span>
                </Button>
              </Dropdown>
            ) : (
              <Button
                type="primary"
                onClick={() => navigate("/login")}
                className="login-btn rounded-full bg-[#8864f0] border-none font-bold"
              >
                ĐĂNG NHẬP
              </Button>
            )}
          </div>
        </div>
      </div>
    </AntHeader>
  );
};

export default Header;
