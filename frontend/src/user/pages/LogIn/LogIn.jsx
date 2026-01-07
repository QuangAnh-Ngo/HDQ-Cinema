import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { message, Spin } from "antd";
import { authService } from "../../../services";
import googleLogo from "../../../assets/images/google-logo-9824.png";
import appleLogo from "../../../assets/images/apple-logo-9708.png";
import "./LogIn.scss";

const LogIn = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Lấy đường dẫn trước đó để quay lại sau khi login thành công
  const from = location.state?.from || "/";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ TEST ACCOUNTS - XÓA KHI DEPLOY PRODUCTION
  const testAccounts = [
    { username: "member1", password: "123456", role: "Member" },
    { username: "employee1", password: "123456", role: "Employee" },
    { username: "manager1", password: "123456", role: "Manager" },
    { username: "admin1", password: "123456", role: "Admin" },
  ];

  //✅Quick login với test account
  const handleQuickLogin = async (account) => {
    setUsername(account.username);
    setPassword(account.password);

    setLoading(true);
    try {
      await authService.login(account.username, account.password);
      message.success(`Đăng nhập thành công với ${account.role}!`);

      const user = authService.getCurrentUser();

      if (authService.hasRole("ADMIN") || authService.hasRole("MANAGER")) {
        navigate("/admin/dashboard");
      } else if (authService.hasRole("EMPLOYEE")) {
        navigate("/admin/movies");
      } else {
        navigate(from, { replace: true });
      }
    } catch (error) {
      console.error("Quick login error:", error);
      message.error(`Không thể đăng nhập ${account.role}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Xử lý đăng nhập
   */
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      message.warning("Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu");
      return;
    }

    setLoading(true);

    try {
      await authService.login(username, password);
      message.success("Đăng nhập thành công!");

      if (authService.hasRole("ADMIN") || authService.hasRole("MANAGER")) {
        navigate("/admin/dashboard");
      } else if (authService.hasRole("EMPLOYEE")) {
        navigate("/admin/movies");
      } else {
        navigate(from, { replace: true });
      }
    } catch (error) {
      console.error("Login error:", error);
      message.error(
        error.message || "Tên đăng nhập hoặc mật khẩu không chính xác"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    message.info(`Chức năng đăng nhập qua ${provider} đang được phát triển`);
  };

  return (
    <div className="login-container">
      <div className="card">
        <form onSubmit={handleLogin}>
          <h2>ĐĂNG NHẬP VÀO TÀI KHOẢN</h2>
          <h3>Sử dụng tên đăng nhập và mật khẩu</h3>

          {/* ✅ QUICK LOGIN BUTTONS - CHỈ HIỂN THỊ TRONG DEV MODE */}
          {/* {process.env.NODE_ENV === "development" && (
            <div
              className="quick-login-section"
              style={{
                marginBottom: "20px",
                padding: "15px",
                background: "#f0f0f0",
                borderRadius: "8px",
                border: "2px dashed #8864f0",
              }}
            >
              <p
                style={{
                  margin: "0 0 10px 0",
                  fontSize: "12px",
                  color: "#666",
                  fontWeight: "bold",
                }}
              >
                🔧 Quick Login (Dev Only):
              </p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "8px",
                }}
              >
                {testAccounts.map((account) => (
                  <button
                    key={account.username}
                    type="button"
                    onClick={() => handleQuickLogin(account)}
                    disabled={loading}
                    style={{
                      padding: "8px 12px",
                      fontSize: "12px",
                      background: "#8864f0",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: "500",
                      transition: "all 0.3s",
                    }}
                    onMouseOver={(e) => (e.target.style.background = "#7050d0")}
                    onMouseOut={(e) => (e.target.style.background = "#8864f0")}
                  >
                    {account.role}
                  </button>
                ))}
              </div>
            </div>
          )} */}

          {/* Username Input */}
          <input
            type="text"
            name="username"
            placeholder="Tên đăng nhập"
            className="focus:ring-2 focus:ring-[#8864f0] outline-none"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
            autoFocus
            required
          />

          {/* Password Input */}
          <input
            type="password"
            name="password"
            placeholder="Mật khẩu"
            className="focus:ring-2 focus:ring-[#8864f0] outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
          />

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Spin size="small" /> <span>Đang xử lý...</span>
              </>
            ) : (
              "Đăng nhập"
            )}
          </button>

          {/* Switch to Register */}
          <p className="switch-auth">
            Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
          </p>

          <span className="or"></span>

          {/* Social Logins */}
          <div className="socials">
            <button
              type="button"
              className="social-btn cursor-pointer"
              onClick={() => handleSocialLogin("Google")}
              disabled={loading}
            >
              <img src={googleLogo} alt="Google" />
              <p>Google</p>
            </button>
            <button
              type="button"
              className="social-btn cursor-pointer"
              onClick={() => handleSocialLogin("Apple")}
              disabled={loading}
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
