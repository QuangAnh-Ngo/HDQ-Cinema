import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { message, Spin } from "antd";
import { memberService, authService } from "../../../services";
import googleLogo from "../../../assets/images/google-logo-9824.png";
import appleLogo from "../../../assets/images/apple-logo-9708.png";
import "./Register.scss";

const Register = () => {
  const navigate = useNavigate();

  // Form state - Cập nhật để khớp với MemberCreationRequest của backend
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dob: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const {
      username,
      password,
      confirmPassword,
      firstName,
      lastName,
      email,
      phone,
      dob,
    } = formData;

    if (
      !username ||
      !password ||
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !dob
    ) {
      message.warning("Vui lòng điền đầy đủ tất cả các trường thông tin");
      return false;
    }

    if (password.length < 8) {
      message.warning("Mật khẩu phải có ít nhất 8 ký tự");
      return false;
    }

    if (password !== confirmPassword) {
      message.warning("Mật khẩu xác nhận không khớp");
      return false;
    }

    // Kiểm tra định dạng Email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      message.warning("Email không hợp lệ");
      return false;
    }

    if (!/^0\d{9}$/.test(phone)) {
      message.warning("Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0)");
      return false;
    }

    const age = new Date().getFullYear() - new Date(dob).getFullYear();
    if (age < 16) {
      message.warning("Bạn phải từ 16 tuổi trở lên để đăng ký");
      return false;
    }

    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      // ✅ FIX: Keep date in YYYY-MM-DD format (backend expects this)
      const registerPayload = {
        username: formData.username,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phone,
        dob: formData.dob, // ✅ Don't convert - keep as YYYY-MM-DD
      };

      console.log("📤 Register payload:", registerPayload);

      // Register
      await memberService.register(registerPayload);

      message.success("Đăng ký tài khoản thành công!");

      // Auto login after register
      try {
        console.log("🔄 Auto-login after register...");

        await authService.login(formData.username, formData.password);

        message.success("Đăng nhập tự động thành công!");
        navigate("/", { replace: true });
      } catch (loginError) {
        console.error("❌ Auto-login failed:", loginError);

        // Navigate to login page with success message
        navigate("/login", {
          state: {
            message: "Đăng ký thành công! Vui lòng đăng nhập.",
            username: formData.username,
          },
        });
      }
    } catch (error) {
      console.error("❌ Register error:", error);

      message.error(
        error.message ||
          error.response?.data?.message ||
          "Đăng ký thất bại. Tên đăng nhập hoặc email có thể đã tồn tại."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="card">
        <form onSubmit={handleRegister}>
          <h2>ĐĂNG KÝ TÀI KHOẢN</h2>

          <input
            type="text"
            name="username"
            placeholder="Tên đăng nhập"
            className="focus:ring-2 focus:ring-[#8864f0] outline-none"
            value={formData.username}
            onChange={handleChange}
            disabled={loading}
            autoFocus
          />

          {/* Container cho Họ và Tên - Dùng Tailwind để dàn hàng ngang mà không hỏng SCSS */}
          <div className="flex gap-2 w-full">
            <input
              type="text"
              name="firstName"
              placeholder="Họ"
              className="flex-1 focus:ring-2 focus:ring-[#8864f0] outline-none"
              value={formData.firstName}
              onChange={handleChange}
              disabled={loading}
            />
            <input
              type="text"
              name="lastName"
              placeholder="Tên"
              className="flex-1 focus:ring-2 focus:ring-[#8864f0] outline-none"
              value={formData.lastName}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <input
            type="email"
            name="email"
            placeholder="Email"
            className="focus:ring-2 focus:ring-[#8864f0] outline-none"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
          />

          <input
            type="tel"
            name="phone"
            placeholder="Số điện thoại (0912345678)"
            className="focus:ring-2 focus:ring-[#8864f0] outline-none"
            value={formData.phone}
            onChange={handleChange}
            disabled={loading}
          />

          <input
            type="date"
            name="dob"
            className="focus:ring-2 focus:ring-[#8864f0] outline-none"
            value={formData.dob}
            onChange={handleChange}
            disabled={loading}
          />

          <input
            type="password"
            name="password"
            placeholder="Mật khẩu (tối thiểu 8 ký tự)"
            className="focus:ring-2 focus:ring-[#8864f0] outline-none"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Xác nhận mật khẩu"
            className="focus:ring-2 focus:ring-[#8864f0] outline-none"
            value={formData.confirmPassword}
            onChange={handleChange}
            disabled={loading}
          />

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
              "Đăng ký"
            )}
          </button>

          <p className="switch-auth">
            Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
          </p>

          <span className="or"></span>

          <div className="socials">
            <button
              type="button"
              className="social-btn cursor-pointer"
              onClick={() => message.info("Chức năng đang được phát triển")}
              disabled={loading}
            >
              <img src={googleLogo} alt="Google" />
              <p>Google</p>
            </button>
            <button
              type="button"
              className="social-btn cursor-pointer"
              onClick={() => message.info("Chức năng đang được phát triển")}
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

export default Register;
