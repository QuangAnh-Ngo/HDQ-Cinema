import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Spin } from "antd";
import { toast } from "react-toastify";
import { memberService, authService } from "../../../services";
import googleLogo from "../../../assets/images/google-logo-9824.png";
import appleLogo from "../../../assets/images/apple-logo-9708.png";
import "./Register.scss";

const Register = () => {
  const navigate = useNavigate();

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

    if (!username.trim()) {
      toast.warning("Vui lòng nhập tên đăng nhập");
      return false;
    }

    if (username.length < 3) {
      toast.warning("Tên đăng nhập phải có ít nhất 3 ký tự");
      return false;
    }

    if (username.length > 50) {
      toast.warning("Tên đăng nhập không được quá 50 ký tự");
      return false;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      toast.warning("Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới");
      return false;
    }

    if (!firstName.trim()) {
      toast.warning("Vui lòng nhập họ");
      return false;
    }

    if (!lastName.trim()) {
      toast.warning("Vui lòng nhập tên");
      return false;
    }

    if (!email.trim()) {
      toast.warning("Vui lòng nhập email");
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.warning("Email không hợp lệ (VD: example@gmail.com)");
      return false;
    }

    if (!phone.trim()) {
      toast.warning("Vui lòng nhập số điện thoại");
      return false;
    }

    if (!/^0\d{9}$/.test(phone)) {
      toast.warning("Số điện thoại phải có 10 số và bắt đầu bằng 0");
      return false;
    }

    if (!dob) {
      toast.warning("Vui lòng chọn ngày sinh");
      return false;
    }

    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    if (age < 16) {
      toast.warning("Bạn phải từ 16 tuổi trở lên để đăng ký");
      return false;
    }

    if (age > 120) {
      toast.warning("Ngày sinh không hợp lệ");
      return false;
    }

    if (!password) {
      toast.warning("Vui lòng nhập mật khẩu");
      return false;
    }

    if (password.length < 8) {
      toast.warning("Mật khẩu phải có ít nhất 8 ký tự");
      return false;
    }

    if (!confirmPassword) {
      toast.warning("Vui lòng xác nhận mật khẩu");
      return false;
    }

    if (password !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return false;
    }

    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const registerPayload = {
        username: formData.username.trim(),
        password: formData.password,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        phoneNumber: formData.phone.trim(),
        dob: formData.dob,
      };

      console.log("📤 Register payload:", registerPayload);

      await memberService.register(registerPayload);

      toast.success("🎉 Đăng ký tài khoản thành công!");

      try {
        console.log("🔄 Auto-login after register...");

        await authService.login(formData.username, formData.password);

        toast.success("Đăng nhập tự động thành công!");
        navigate("/", { replace: true });
      } catch (loginError) {
        console.error("❌ Auto-login failed:", loginError);

        toast.info("Vui lòng đăng nhập để tiếp tục");
        navigate("/login", {
          state: {
            message: "Đăng ký thành công! Vui lòng đăng nhập.",
            username: formData.username,
          },
        });
      }
    } catch (error) {
      console.error("❌ Register error:", error);

      const errorMessage = error.message || error.response?.data?.message || "";

      if (
        errorMessage.toLowerCase().includes("username") ||
        errorMessage.toLowerCase().includes("tên đăng nhập")
      ) {
        toast.error("Tên đăng nhập đã được sử dụng. Vui lòng chọn tên khác.");
      } else if (errorMessage.toLowerCase().includes("email")) {
        toast.error("Email đã được đăng ký. Vui lòng sử dụng email khác.");
      } else if (
        errorMessage.toLowerCase().includes("phone") ||
        errorMessage.toLowerCase().includes("điện thoại")
      ) {
        toast.error("Số điện thoại đã được đăng ký. Vui lòng sử dụng số khác.");
      } else if (errorMessage.toLowerCase().includes("password")) {
        toast.error("Mật khẩu không đáp ứng yêu cầu bảo mật.");
      } else {
        toast.error(errorMessage || "Đăng ký thất bại. Vui lòng thử lại sau.");
      }
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
            className="focus:ring-2 focus:ring-[#c9a86c] outline-none"
            value={formData.username}
            onChange={handleChange}
            disabled={loading}
            autoFocus
          />

          <div className="name-row">
            <input
              type="text"
              name="firstName"
              placeholder="Họ"
              value={formData.firstName}
              onChange={handleChange}
              disabled={loading}
            />
            <input
              type="text"
              name="lastName"
              placeholder="Tên"
              value={formData.lastName}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <input
            type="email"
            name="email"
            placeholder="Email"
            className="focus:ring-2 focus:ring-[#c9a86c] outline-none"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
          />

          <input
            type="tel"
            name="phone"
            placeholder="Số điện thoại (0912345678)"
            className="focus:ring-2 focus:ring-[#c9a86c] outline-none"
            value={formData.phone}
            onChange={handleChange}
            disabled={loading}
          />

          <input
            type="date"
            name="dob"
            className="focus:ring-2 focus:ring-[#c9a86c] outline-none"
            value={formData.dob}
            onChange={handleChange}
            disabled={loading}
            max={new Date().toISOString().split("T")[0]}
          />

          <input
            type="password"
            name="password"
            placeholder="Mật khẩu (tối thiểu 8 ký tự)"
            className="focus:ring-2 focus:ring-[#c9a86c] outline-none"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Xác nhận mật khẩu"
            className="focus:ring-2 focus:ring-[#c9a86c] outline-none"
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
              onClick={() => toast.info("Chức năng đang được phát triển")}
              disabled={loading}
            >
              <img src={googleLogo} alt="Google" />
              <p>Google</p>
            </button>
            <button
              type="button"
              className="social-btn cursor-pointer"
              onClick={() => toast.info("Chức năng đang được phát triển")}
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
