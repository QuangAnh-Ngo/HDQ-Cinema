// frontend/src/admin/pages/Employees.jsx
import { useState, useEffect } from "react";
import { FiSearch } from "react-icons/fi";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Tag,
  Space,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { employeeService, accountService, authService } from "../../services";
import PermissionWrapper from "../components/Common/PermissionWrapper";
import "../styles/EmployeesPage.scss";

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [form] = Form.useForm();

  const currentUserRole = authService.getHighestRole();
  const isAdmin = authService.isAdmin();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterEmployees();
  }, [employees, searchTerm]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [empData, accData] = await Promise.all([
        employeeService.getAll(),
        accountService.getAll(),
      ]);

      console.log("📦 Raw Employees:", empData);
      console.log("📦 Raw Accounts:", accData);

      // Merge bằng EMAIL
      const merged = empData.map((emp) => {
        const account = accData.find((acc) => {
          if (acc.employeeId && String(acc.employeeId) === String(emp.id)) {
            return true;
          }
          return acc.email?.toLowerCase() === emp.email?.toLowerCase();
        });

        if (account) {
          console.log(
            `✅ Match: Employee ${emp.id} (${emp.email}) -> Account ${account.username}`
          );
        }

        // Extract role names
        const roleNames = (account?.roles || []).map((r) =>
          typeof r === "string" ? r : r.name
        );

        return {
          ...emp,
          key: emp.id,
          account: account || null,
          accountId: account?.employeeAccountId || null,
          accountUsername: account?.username || null,
          username: account?.username || null,
          roles: account?.roles || [],
          roleNames: roleNames,
          // ✅ Tính vai trò cao nhất để hiển thị
          highestRole: getHighestRoleFromList(roleNames),
        };
      });

      console.log("✅ Merged employees:", merged);

      setEmployees(merged);
      setFilteredEmployees(merged);
    } catch (error) {
      console.error("Fetch data error:", error);
      message.error("Không thể tải danh sách nhân viên");
      setEmployees([]);
      setFilteredEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Hàm lấy vai trò cao nhất
  const getHighestRoleFromList = (roleNames) => {
    if (!roleNames || roleNames.length === 0) return null;
    if (roleNames.includes("ADMIN")) return "ADMIN";
    if (roleNames.includes("MANAGER")) return "MANAGER";
    if (roleNames.includes("EMPLOYEE")) return "EMPLOYEE";
    return roleNames[0];
  };

  const filterEmployees = () => {
    let filtered = [...employees];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (emp) =>
          emp.firstName?.toLowerCase().includes(term) ||
          emp.lastName?.toLowerCase().includes(term) ||
          emp.email?.toLowerCase().includes(term) ||
          emp.phone?.includes(term) ||
          emp.username?.toLowerCase().includes(term)
      );
    }

    setFilteredEmployees(filtered);
  };

  const handleOpenModal = (mode, employee = null) => {
    setModalMode(mode);
    setSelectedEmployee(employee);
    setModalVisible(true);

    setTimeout(() => {
      if (mode === "edit" && employee) {
        form.setFieldsValue({
          firstName: employee.firstName,
          lastName: employee.lastName,
          phone: employee.phone,
          email: employee.email,
          username: employee.username,
          roles: employee.roleNames || [],
        });
      } else {
        form.resetFields();
      }
    }, 100);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (modalMode === "create") {
        // Step 1: Create employee
        const empPayload = {
          firstName: values.firstName,
          lastName: values.lastName,
          phone: values.phone,
          email: values.email,
        };

        console.log("Create employee payload:", empPayload);
        const newEmployee = await employeeService.create(empPayload);
        console.log("✅ Employee created:", newEmployee);

        // Step 2: Create account
        const accPayload = {
          username: values.username,
          password: values.password,
          email: values.email,
          roles: values.roles || ["EMPLOYEE"],
          employeeId: newEmployee.id,
        };

        await accountService.create(accPayload);
        console.log("✅ Account created");

        message.success("Tạo nhân viên thành công!");
      } else {
        // Edit mode
        const empPayload = {
          firstName: values.firstName,
          lastName: values.lastName,
          phone: values.phone,
          email: values.email,
        };

        await employeeService.update(selectedEmployee.id, empPayload);
        console.log("✅ Employee updated");

        if (selectedEmployee.accountId) {
          const accPayload = {
            roles: values.roles || [],
            employeeId: selectedEmployee.id,
          };

          if (values.password && values.password.trim()) {
            accPayload.password = values.password;
          }

          await accountService.update(selectedEmployee.accountId, accPayload);
          console.log("✅ Account updated");
        }

        message.success("Cập nhật nhân viên thành công!");
      }

      setModalVisible(false);
      form.resetFields();
      fetchData();
    } catch (error) {
      console.error("Submit error:", error);
      const errorMsg = error.response?.data?.message || error.message;
      message.error(errorMsg || "Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (employee) => {
    try {
      setLoading(true);

      console.log("🗑️ Deleting employee:", {
        id: employee.id,
        email: employee.email,
        accountId: employee.accountId,
        accountUsername: employee.accountUsername,
      });

      // Step 1: Xóa Account trước (nếu có)
      if (employee.accountId) {
        try {
          console.log("📤 Deleting account by ID:", employee.accountId);
          await accountService.delete(employee.accountId);
          console.log("✅ Account deleted successfully");
        } catch (accError) {
          console.warn("⚠️ Failed to delete account by ID:", accError);
        }
      } else if (employee.accountUsername) {
        try {
          console.log(
            "📤 Finding account by username:",
            employee.accountUsername
          );
          const accounts = await accountService.getAll();
          const account = accounts.find(
            (acc) => acc.username === employee.accountUsername
          );

          if (account && account.employeeAccountId) {
            console.log("📤 Deleting account:", account.employeeAccountId);
            await accountService.delete(account.employeeAccountId);
            console.log("✅ Account deleted successfully");
          }
        } catch (accError) {
          console.warn("⚠️ Failed to delete account:", accError);
        }
      }

      // Step 2: Xóa Employee
      console.log("📤 Deleting employee:", employee.id);
      await employeeService.delete(employee.id);
      console.log("✅ Employee deleted successfully");

      message.success("Xóa nhân viên thành công!");
      fetchData();
    } catch (error) {
      console.error("❌ Delete error:", error);

      if (error.status === 500) {
        message.error("Không thể xóa nhân viên. Vui lòng thử lại.");
      } else if (error.status === 403) {
        message.error("Bạn không có quyền xóa nhân viên này.");
      } else {
        message.error(error.message || "Không thể xóa nhân viên");
      }
    } finally {
      setLoading(false);
    }
  };

  const canManageEmployee = (employee) => {
    const empRoles = employee.roleNames || [];

    if (isAdmin) {
      return !empRoles.includes("ADMIN");
    }

    if (currentUserRole === "MANAGER") {
      return !empRoles.includes("MANAGER") && !empRoles.includes("ADMIN");
    }

    return false;
  };

  // ✅ Màu sắc theo vai trò
  const getRoleColor = (role) => {
    const colors = {
      ADMIN: "red",
      MANAGER: "orange",
      EMPLOYEE: "blue",
    };
    return colors[role] || "default";
  };

  // ✅ Label tiếng Việt
  const getRoleLabel = (role) => {
    const labels = {
      ADMIN: "Quản trị viên",
      MANAGER: "Quản lý",
      EMPLOYEE: "Nhân viên",
    };
    return labels[role] || role || "Chưa có";
  };

  const columns = [
    {
      title: "Mã NV",
      dataIndex: "id",
      key: "id",
      width: 80,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: "Họ và tên",
      key: "fullName",
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600 }}>
            {record.firstName} {record.lastName}
          </div>
          <small style={{ color: "#888" }}>{record.email}</small>
        </div>
      ),
    },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
      width: 120,
      render: (text) => text || <span style={{ color: "#ccc" }}>-</span>,
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
      width: 130,
    },
    {
      // ✅ FIX: Hiển thị vai trò từ Account thay vì Position
      title: "Vai trò",
      key: "role",
      width: 130,
      render: (_, record) => {
        const role = record.highestRole;
        return role ? (
          <Tag color={getRoleColor(role)}>{getRoleLabel(role)}</Tag>
        ) : (
          <Tag>Chưa có TK</Tag>
        );
      },
      filters: [
        { text: "Quản trị viên", value: "ADMIN" },
        { text: "Quản lý", value: "MANAGER" },
        { text: "Nhân viên", value: "EMPLOYEE" },
      ],
      onFilter: (value, record) => record.highestRole === value,
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 180,
      render: (_, record) => {
        const canManage = canManageEmployee(record);

        return (
          <Space>
            {canManage ? (
              <>
                <Button
                  type="primary"
                  ghost
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => handleOpenModal("edit", record)}
                >
                  Sửa
                </Button>

                <Popconfirm
                  title="Xác nhận xóa?"
                  description="Dữ liệu sẽ không thể khôi phục."
                  onConfirm={() => handleDelete(record)}
                  okText="Xóa"
                  cancelText="Hủy"
                  okButtonProps={{ danger: true }}
                >
                  <Button danger size="small" icon={<DeleteOutlined />}>
                    Xóa
                  </Button>
                </Popconfirm>
              </>
            ) : (
              <Tag color="gold">Không có quyền</Tag>
            )}
          </Space>
        );
      },
    },
  ];

  const getAvailableRoles = () => {
    if (isAdmin) {
      return [
        { value: "EMPLOYEE", label: "Nhân viên" },
        { value: "MANAGER", label: "Quản lý" },
      ];
    }

    if (currentUserRole === "MANAGER") {
      return [{ value: "EMPLOYEE", label: "Nhân viên" }];
    }

    return [];
  };

  return (
    <div className="employees-page">
      <div className="page-header">
        <div>
          <h1>Quản lý nhân viên</h1>
          <p className="page-subtitle">
            Quản lý thông tin và phân quyền nhân viên
          </p>
        </div>

        <PermissionWrapper allowedRoles={["ADMIN", "MANAGER"]}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => handleOpenModal("create")}
          >
            Thêm nhân viên
          </Button>
        </PermissionWrapper>
      </div>

      <div className="filters-bar" style={{ marginBottom: 16 }}>
        <Input
          placeholder="Tìm kiếm theo tên, email, SĐT, username..."
          prefix={<FiSearch />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ maxWidth: 400 }}
          allowClear
        />
      </div>

      <div className="page-content">
        <Table
          columns={columns}
          dataSource={filteredEmployees}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} nhân viên`,
          }}
        />
      </div>

      <Modal
        title={
          modalMode === "create" ? (
            <span>
              <UserAddOutlined /> Thêm nhân viên mới
            </span>
          ) : (
            <span>
              <EditOutlined /> Chỉnh sửa nhân viên
            </span>
          )
        }
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        okText={modalMode === "create" ? "Tạo mới" : "Cập nhật"}
        cancelText="Hủy"
        width={600}
        confirmLoading={loading}
        forceRender
      >
        <Form form={form} layout="vertical" requiredMark="optional">
          <div style={{ marginBottom: 16, color: "#666", fontWeight: 500 }}>
            Thông tin cá nhân
          </div>

          <div style={{ display: "flex", gap: 16 }}>
            <Form.Item
              name="firstName"
              label="Họ"
              rules={[{ required: true, message: "Vui lòng nhập họ" }]}
              style={{ flex: 1 }}
            >
              <Input placeholder="Nguyễn" />
            </Form.Item>

            <Form.Item
              name="lastName"
              label="Tên"
              rules={[{ required: true, message: "Vui lòng nhập tên" }]}
              style={{ flex: 1 }}
            >
              <Input placeholder="Văn A" />
            </Form.Item>
          </div>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Vui lòng nhập email" },
              { type: "email", message: "Email không hợp lệ" },
            ]}
          >
            <Input placeholder="nhanvien@hdqcinema.com" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[
              { required: true, message: "Vui lòng nhập SĐT" },
              { pattern: /^0\d{9}$/, message: "SĐT phải có 10 số" },
            ]}
          >
            <Input placeholder="0912345678" />
          </Form.Item>

          <div
            style={{
              marginBottom: 16,
              marginTop: 24,
              color: "#666",
              fontWeight: 500,
            }}
          >
            Thông tin tài khoản
          </div>

          {modalMode === "create" && (
            <>
              <Form.Item
                name="username"
                label="Username"
                rules={[
                  { required: true, message: "Vui lòng nhập username" },
                  { min: 3, message: "Tối thiểu 3 ký tự" },
                ]}
              >
                <Input placeholder="nhanvien01" />
              </Form.Item>

              <Form.Item
                name="password"
                label="Mật khẩu"
                rules={[
                  { required: true, message: "Vui lòng nhập mật khẩu" },
                  { min: 8, message: "Tối thiểu 8 ký tự" },
                ]}
              >
                <Input.Password placeholder="Tối thiểu 8 ký tự" />
              </Form.Item>
            </>
          )}

          {modalMode === "edit" && (
            <Form.Item
              name="password"
              label="Mật khẩu mới"
              extra="Để trống nếu không đổi"
            >
              <Input.Password placeholder="Nhập mật khẩu mới" />
            </Form.Item>
          )}

          <Form.Item
            name="roles"
            label="Vai trò"
            rules={[{ required: true, message: "Chọn vai trò" }]}
          >
            <Select
              mode="multiple"
              placeholder="Chọn vai trò"
              options={getAvailableRoles()}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Employees;
