import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import { login } from "../../services/api";
import googleLogo from "../../assets/images/google-logo-9824.png";
import appleLogo from "../../assets/images/apple-logo-9708.png";
import './LogIn.scss';

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

        // // Giả lập đăng nhập 
        // if (username === "user" && password === "user") {
        //     localStorage.setItem("token", "fake-jwt-token");
        //     localStorage.setItem("user", JSON.stringify({ name: "Admin", email: "admin@gmail.com" }));
        //     message.success("Đăng nhập thành công!");
        //     navigate("/");
        // } else {
        //     alert("Sai email hoặc mật khẩu!");
        // }

        try {
            const res = await login(username, password);

            if (res.result?.token) {
                message.success("Đăng nhập thành công!");

                localStorage.setItem("token", res.result.token);
                // if (res.result.user) {
                //     localStorage.setItem("user", JSON.stringify(res.result.user));
                // }

                //user giả 
                localStorage.setItem("user", JSON.stringify({ name: "Admin giả", email: "fake-admin@gmail.com" }));

                navigate("/");
            } else {
                alert("Không nhận được token từ máy chủ!");
            }
        } catch (err) {
            console.error(err);
            alert(err.message || "Sai tên đăng nhập hoặc mật khẩu!");
        }
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