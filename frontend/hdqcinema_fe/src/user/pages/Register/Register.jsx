import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import { register } from "../../services/api";
import googleLogo from "../../../assets/images/google-logo-9824.png";
import appleLogo from "../../../assets/images/apple-logo-9708.png";
import "./Register.scss";

const Register = () => {
  const [username, setUsername] = useState("");
  // const [email, setEmail] = useState('');
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!username || !password || !confirmPassword) {
      alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (password !== confirmPassword) {
      alert("Mật khẩu nhập lại không khớp");
      return;
    }

    // try {
    //     const res = await register(username, password);

    //     console.log("Register Response:", res);

    //     message.success("Đăng ký thành công! Vui lòng đăng nhập.");
    //     navigate("/login");

    // } catch (error) {
    //     message.error(error.message || "Đăng ký thất bại!");
    // }

    // Giả lập đăng ký
    localStorage.setItem(
      "registeredUser",
      JSON.stringify({ username, password })
    );
    message.success("Đăng ký thành công!");
    navigate("/login");
    // Kết thúc giả lập đăng ký
  };

  return (
    <div className="register-container">
      <div className="card">
        <form onSubmit={handleRegister}>
          <h2>ĐĂNG KÝ TÀI KHOẢN</h2>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          {/* <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    /> */}
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <button type="submit">Đăng ký</button>

          <span className="or"></span>

          <div className="socials">
            <button
              type="button"
              className="social-btn"
              onClick={() => message.info("Chức năng Google chưa được bật")}
            >
              <img src={googleLogo} alt="Google" />
              <p>Google</p>
            </button>
            <button
              type="button"
              className="social-btn"
              onClick={() => message.info("Chức năng Apple chưa được bật")}
            >
              <img src={appleLogo} alt="Apple" />
              <p>Apple</p>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
