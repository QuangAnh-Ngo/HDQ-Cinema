import { Layout } from 'antd';
import './Footer.scss';

const { Footer: AntFooter } = Layout;

const Footer = () => (
    <AntFooter className='footer'>
        <div className="footer-container">
            <div className="item">
                <div className="footer-info">
                    <h3>Liên hệ</h3>
                    <br></br>
                    <p>Hotline: 1900 xxxx</p>
                    <p>Email: myemail@gmail.com</p>
                </div>
            </div>

            <div className="item">
                <div className="footer-social">
                    <h3>Kết nối với chúng tôi</h3>
                    <br></br>
                    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                        <i className="fab fa-facebook"></i>
                    </a>
                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                        <i className="fab fa-instagram"></i>
                    </a>
                </div>
            </div>
        </div>
    </AntFooter>
);

export default Footer;