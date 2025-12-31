import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { message } from "antd";
import { login } from "../../services/api";
import googleLogo from "../../../assets/images/google-logo-9824.png";
import appleLogo from "../../../assets/images/apple-logo-9708.png";
import "./LogIn.scss";

const LogIn = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    // Giả lập đăng nhập
    if (username === "user" && password === "user") {
      localStorage.setItem("token", "fake-jwt-token");
      localStorage.setItem("role", "user");
      localStorage.setItem("user", JSON.stringify({ name: "User giả" }));
      message.success("Đăng nhập thành công!");
      navigate("/");
    } else if (username === "admin" && password === "admin") {
      localStorage.setItem("token", "fake-jwt-token-2");
      localStorage.setItem("role", "admin");
      localStorage.setItem("user", JSON.stringify({ name: "Admin giả" }));
      message.success("Đăng nhập thành công!");
      navigate("/admin");
    } else {
      alert("Sai email hoặc mật khẩu!");
    }
    // kết thúc giả lập đăng nhập

    // // Giả lập đăng nhập cho tài khoản mới register
    // const savedUser = JSON.parse(localStorage.getItem("registeredUser"));
    // if (
    //   savedUser &&
    //   username === savedUser.username &&
    //   password === savedUser.password
    // ) {
    //   localStorage.setItem("token", "fake-jwt-token");
    //   localStorage.setItem(
    //     "user",
    //     JSON.stringify({ name: username, email: "user@example.com" })
    //   );
    //   message.success("Đăng nhập thành công!");
    //   navigate("/");
    // } else {
    //   alert("Sai tên đăng nhập hoặc mật khẩu!");
    // }
    // //Kết thúc giả lập đăng nhập

    // try {
    //     const res = await login(username, password);

    //     if (res.result?.token) {
    //         message.success("Đăng nhập thành công!");

    //         localStorage.setItem("token", res.result.token);
    //         // if (res.result.user) {
    //         //     localStorage.setItem("user", JSON.stringify(res.result.user));
    //         // }

    //         //user giả
    //         localStorage.setItem("user", JSON.stringify({ name: "Admin giả"}));

    //         navigate("/");
    //     } else {
    //         alert("Không nhận được token từ máy chủ!");
    //     }
    // } catch (err) {
    //     console.error(err);
    //     alert(err.message || "Sai tên đăng nhập hoặc mật khẩu!");
    // }

    // // Sau khi login thành công
    // const handleLoginSuccess = (response) => {
    //   localStorage.setItem("token", response.data.token);
    //   localStorage.setItem("userRole", response.data.role); // 'admin', 'manager', 'user'
    //   localStorage.setItem("userName", response.data.name);

    //   // Redirect dựa vào role
    //   if (response.data.role === "admin" || response.data.role === "manager") {
    //     navigate("/admin/dashboard");
    //   } else {
    //     navigate("/");
    //   }
    // };
  };

  return (
    <div className="login-container">
      <div className="card">
        <form onSubmit={handleLogin}>
          <h2>ĐĂNG NHẬP VÀO TÀI KHOẢN</h2>
          <h3>Sử dụng email hoặc mật khẩu</h3>

          <input
            type="text"
            placeholder="Tên đăng nhập"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit">Đăng nhập</button>

          <p className="switch-auth">
            Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
          </p>

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

export default LogIn;
