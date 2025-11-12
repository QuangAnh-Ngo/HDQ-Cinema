import { Layout, Menu, Cascader, Button } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import './Header.scss';
import logo from "../../assets/images/HDQ-Cinema-logo.png";
import { useEffect, useState } from "react";
import { getCinemas } from '../../services/api';

const { Header: AntHeader } = Layout;

const Header = () => {
    const navigate = useNavigate();
    const [cinemas, setCinemas] = useState([]);
    const [user, setUser] = useState(null);


    useEffect(() => {
        const fetchCinemas = async () => {
            try {
                const data = await getCinemas();
                setCinemas(data);
            } catch (error) {
                console.error('Error fetching cinemas:', error);
                setCinemas([]);
            }
        };
        fetchCinemas();
    }, []);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) setUser(JSON.parse(storedUser));
    }, []);

    const options = [];
    cinemas.forEach((c) => {
        let city = options.find((o) => o.value === c.city);
        if (!city) {
            city = { value: c.city, label: c.city, children: [] };
            options.push(city);
        }

        let district = city.children.find((o) => o.value === c.district);
        if (!district) {
            district = { value: c.district, label: c.district, children: [] };
            city.children.push(district);
        }

        district.children.push({
            value: c.cinema_id,
            label: c.name,
        });
    });

    const handleChange = (value) => {
        if (!value || value.length === 0) return;
        const cinemaId = value[value.length - 1];
        navigate("/", { state: { cinema_id: cinemaId } });
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        navigate("/login");
    };

    return (
        <AntHeader className='header'>
            <div className="header-container">
                <div className="wrap">
                    <div className="logo">
                        <Link to="/">
                            <img src={logo} alt="HDQ Cinema Logo" />
                        </Link>
                    </div>

                    <Cascader
                        options={options}
                        onChange={handleChange}
                        placeholder="Chọn rạp"
                        className="cinema-cascader"
                        displayRender={(labels) => labels[labels.length - 1]}
                        allowClear={false}
                    />

                    <nav className='menu'>
                        <Menu mode="horizontal" className='menu-list'>
                            <Menu.Item key="1"><Link to="#">Lịch chiếu theo rạp</Link></Menu.Item>
                            <Menu.Item key="2"><Link to="#">Phim</Link></Menu.Item>
                            <Menu.Item key="3"><Link to="#">Rạp</Link></Menu.Item>
                            <Menu.Item key="4"><Link to="#">Giá vé</Link></Menu.Item>
                            <Menu.Item key="5"><Link to="#">Thành viên</Link></Menu.Item>
                        </Menu>
                    </nav>

                    <div className="user-section">
                        {user ? (
                            <>
                                <span className="username">👤{user.name}</span>
                                <Button type="link" onClick={handleLogout} className="logout-btn">
                                    Đăng xuất
                                </Button>
                            </>
                        ) : (
                            <Button type="primary" onClick={() => navigate("/login")} className="login-btn">
                                Đăng nhập
                            </Button>
                        )}
                    </div>

                </div>
            </div>
        </AntHeader>
    );
};

export default Header;