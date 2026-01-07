import { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  DatePicker,
  message,
  Card,
  Avatar,
  Spin,
  Divider,
  Modal,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  LockOutlined,
  SaveOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { memberService, authService } from "../../../services";
import "./Profile.scss";

const Profile = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [memberInfo, setMemberInfo] = useState(null);
  const [formReady, setFormReady] = useState(false);

  useEffect(() => {
    setFormReady(true);
  }, []);

  useEffect(() => {
    if (formReady) {
      fetchMemberInfo();
    }
  }, [formReady]);

  const fetchMemberInfo = async () => {
    try {
      setLoading(true);
      const data = await memberService.getMyInfo();
      console.log("📦 Member info:", data);
      setMemberInfo(data);

      setTimeout(() => {
        form.setFieldsValue({
          username: data.username,
          email: data.email,
          phoneNumber: data.phoneNumber,
          firstName: data.firstName,
          lastName: data.lastName,
          dob: data.dob ? dayjs(data.dob) : null,
        });
      }, 0);
    } catch (error) {
      console.error("Fetch member info error:", error);
      if (error.status === 401 || error.status === 403) {
        message.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
        navigate("/login");
      } else if (error.status === 404) {
        message.error("Không tìm thấy thông tin. Vui lòng đăng nhập lại.");
        localStorage.clear();
        navigate("/login");
      } else {
        message.error("Không thể tải thông tin cá nhân");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setSaving(true);

      const currentUser = authService.getCurrentUser();
      const memberId = currentUser?.memberId || currentUser?.accountId;

      console.log("🔍 Current user:", currentUser);
      console.log("🔍 Member ID:", memberId);

      if (!memberId) {
        message.error(
          "Không tìm thấy thông tin tài khoản. Vui lòng đăng nhập lại."
        );
        navigate("/login");
        return;
      }

      const payload = {
        email: values.email,
        phoneNumber: values.phoneNumber,
        dob: values.dob ? values.dob.format("YYYY-MM-DD") : null,
      };

      if (values.newPassword && values.newPassword.trim()) {
        payload.password = values.newPassword;
      }

      console.log("📤 Update payload:", payload);

      await memberService.update(memberId, payload);

      if (values.newPassword && values.newPassword.trim()) {
        Modal.success({
          title: "Cập nhật thành công!",
          content: "Mật khẩu đã được thay đổi. Vui lòng đăng nhập lại.",
          okText: "Đăng nhập lại",
          onOk: () => {
            localStorage.clear();
            navigate("/login");
          },
        });
      } else {
        message.success("Cập nhật thông tin thành công!");

        setMemberInfo({
          ...memberInfo,
          email: values.email,
          phoneNumber: values.phoneNumber,
          dob: values.dob ? values.dob.format("YYYY-MM-DD") : null,
        });

        form.setFieldsValue({
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (error) {
      console.error("Update error:", error);
      message.error(error.message || "Cập nhật thất bại. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        <Card className="profile-card">
          {loading ? (
            <div className="profile-loading">
              <Spin size="large" />
              <p>Đang tải thông tin...</p>
            </div>
          ) : (
            <>
              <div className="profile-header">
                <Avatar
                  size={100}
                  icon={<UserOutlined />}
                  className="profile-avatar"
                />
                <div className="profile-info">
                  <h1>
                    {memberInfo?.firstName} {memberInfo?.lastName}
                  </h1>
                  <p className="username">@{memberInfo?.username}</p>
                  <p className="member-since">Thành viên HDQ Cinema</p>
                </div>
              </div>

              <Divider />

              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                requiredMark="optional"
                className="profile-form"
              >
                <div className="form-section">
                  <h3>Thông tin cá nhân</h3>

                  <div className="form-row">
                    <Form.Item
                      name="firstName"
                      label="Họ"
                      className="form-item-half"
                    >
                      <Input
                        prefix={<UserOutlined />}
                        placeholder="Họ"
                        disabled
                        className="input-disabled"
                      />
                    </Form.Item>

                    <Form.Item
                      name="lastName"
                      label="Tên"
                      className="form-item-half"
                    >
                      <Input
                        prefix={<UserOutlined />}
                        placeholder="Tên"
                        disabled
                        className="input-disabled"
                      />
                    </Form.Item>
                  </div>

                  <Form.Item name="username" label="Tên đăng nhập">
                    <Input
                      prefix={<UserOutlined />}
                      placeholder="Tên đăng nhập"
                      disabled
                      className="input-disabled"
                    />
                  </Form.Item>

                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                      { required: true, message: "Vui lòng nhập email" },
                      { type: "email", message: "Email không hợp lệ" },
                    ]}
                  >
                    <Input prefix={<MailOutlined />} placeholder="Email" />
                  </Form.Item>

                  <Form.Item
                    name="phoneNumber"
                    label="Số điện thoại"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập số điện thoại",
                      },
                      { pattern: /^0\d{9}$/, message: "SĐT phải có 10 số" },
                    ]}
                  >
                    <Input
                      prefix={<PhoneOutlined />}
                      placeholder="Số điện thoại"
                    />
                  </Form.Item>

                  <Form.Item name="dob" label="Ngày sinh">
                    <DatePicker
                      format="DD/MM/YYYY"
                      placeholder="Chọn ngày sinh"
                      className="date-picker-full"
                      suffixIcon={<CalendarOutlined />}
                      disabledDate={(current) =>
                        current && current > dayjs().subtract(13, "year")
                      }
                    />
                  </Form.Item>
                </div>

                <Divider />

                <div className="form-section">
                  <h3>Đổi mật khẩu</h3>
                  <p className="section-hint">
                    Để trống nếu không muốn đổi mật khẩu
                  </p>

                  <Form.Item
                    name="newPassword"
                    label="Mật khẩu mới"
                    rules={[
                      { min: 8, message: "Mật khẩu phải có ít nhất 8 ký tự" },
                    ]}
                  >
                    <Input.Password
                      prefix={<LockOutlined />}
                      placeholder="Nhập mật khẩu mới"
                    />
                  </Form.Item>

                  <Form.Item
                    name="confirmPassword"
                    label="Xác nhận mật khẩu"
                    dependencies={["newPassword"]}
                    rules={[
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (
                            !value ||
                            getFieldValue("newPassword") === value
                          ) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            "Mật khẩu xác nhận không khớp!"
                          );
                        },
                      }),
                    ]}
                  >
                    <Input.Password
                      prefix={<LockOutlined />}
                      placeholder="Nhập lại mật khẩu mới"
                    />
                  </Form.Item>
                </div>

                <div className="form-actions">
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={saving}
                    icon={<SaveOutlined />}
                    size="large"
                    className="save-btn"
                  >
                    Lưu thay đổi
                  </Button>
                </div>
              </Form>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Profile;
