import { Layout } from "antd";
import { useState, useEffect } from "react";
import { cinemaService } from "../../../services";
import "./Footer.scss";

const { Footer: AntFooter } = Layout;

const Footer = () => {
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCinemas = async () => {
      try {
        const data = await cinemaService.getAll();
        setCinemas(data);
      } catch (error) {
        console.error("Error fetching cinemas:", error);
        setCinemas([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCinemas();
  }, []);

  return (
    <AntFooter className="footer">
      <div className="footer-container">
        <div className="item">
          <div className="footer-cinemas">
            <h3>Hệ thống rạp</h3>
            <br />
            {loading ? (
              <p>Đang tải...</p>
            ) : cinemas.length > 0 ? (
              cinemas.map((cinema) => (
                <p key={cinema.id}>{cinema.name}</p> // Backend dùng cinema.id
              ))
            ) : (
              <p>Chưa có thông tin rạp</p>
            )}
          </div>
        </div>

        <div className="item">
          <div className="footer-info">
            <h3>Liên hệ</h3>
            <br />
            <p>Hotline: 1900 xxxx</p>
            <p>Email: myemail@gmail.com</p>
          </div>
        </div>

        <div className="item">
          <div className="footer-social">
            <h3>Kết nối với chúng tôi</h3>
            <br />
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fab fa-facebook"></i>
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fab fa-instagram"></i>
            </a>
          </div>
        </div>
      </div>
    </AntFooter>
  );
};

export default Footer;
