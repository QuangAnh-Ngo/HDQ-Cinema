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
  const [accounts, setAccounts] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // ✅ ADD if you want search
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // "create" | "edit"
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

      // ✅ Merge employee + account data
      const merged = empData.map((emp) => {
        const account = accData.find((acc) => acc.employee === emp.id);
        return {
          ...emp,
          key: emp.id, // ✅ Add key for Table
          account: account,
          accountId: account?.employeeAccountId,
          username: account?.username,
          email: account?.email || emp.email,
          roles: account?.roles || [],
        };
      });

      setEmployees(merged);
      setFilteredEmployees(merged); // ✅ Initialize filtered list
      setAccounts(accData);
    } catch (error) {
      console.error("Fetch data error:", error);
      message.error("Không thể tải danh sách nhân viên");
      setEmployees([]);
      setFilteredEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const filterEmployees = () => {
    let filtered = [...employees];

    if (searchTerm) {
      filtered = filtered.filter(
        (emp) =>
          emp.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.username?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredEmployees(filtered);
  };

  /**
   * ✅ Open modal for create/edit
   */
  const handleOpenModal = (mode, employee = null) => {
    setModalMode(mode);
    setSelectedEmployee(employee);
    setModalVisible(true);

    if (mode === "edit" && employee) {
      form.setFieldsValue({
        firstName: employee.firstName,
        lastName: employee.lastName,
        phone: employee.phone,
        email: employee.email,
        username: employee.username,
        roles: employee.roles.map((r) => (typeof r === "string" ? r : r.name)),
      });
    } else {
      form.resetFields();
    }
  };

  /**
   * ✅ Handle form submit (create/edit)
   */
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (modalMode === "create") {
        // ✅ 1. Create employee profile
        const empPayload = {
          firstName: values.firstName,
          lastName: values.lastName,
          phone: values.phone,
          email: values.email,
        };

        const employee = await employeeService.create(empPayload);
        console.log("✅ Employee created:", employee);

        // ✅ 2. Create account linked to employee
        const accPayload = {
          username: values.username,
          password: values.password,
          email: values.email,
          roles: values.roles || ["EMPLOYEE"],
          employeeId: employee.id, // Link to employee
        };

        await accountService.create(accPayload);
        console.log("✅ Account created");

        message.success("Tạo nhân viên thành công!");
      } else {
        // ✅ Edit: Update employee + account
        const empPayload = {
          firstName: values.firstName,
          lastName: values.lastName,
          phone: values.phone,
          email: values.email,
        };

        await employeeService.update(selectedEmployee.id, empPayload);

        // Update account if exists
        if (selectedEmployee.accountId) {
          const accPayload = {
            roles: values.roles,
          };

          // Only update password if provided
          if (values.password) {
            accPayload.password = values.password;
          }

          await accountService.update(selectedEmployee.accountId, accPayload);
        }

        message.success("Cập nhật nhân viên thành công!");
      }

      setModalVisible(false);
      form.resetFields();
      fetchData();
    } catch (error) {
      console.error("Submit error:", error);
      message.error(
        error.response?.data?.message || "Có lỗi xảy ra khi lưu nhân viên"
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * ✅ Delete employee
   */
  const handleDelete = async (employee) => {
    try {
      setLoading(true);

      // ✅ 1. Delete account first (if exists)
      if (employee.accountId) {
        await accountService.delete(employee.accountId);
      }

      // ✅ 2. Delete employee profile
      await employeeService.delete(employee.id);

      message.success("Xóa nhân viên thành công!");
      fetchData();
    } catch (error) {
      console.error("Delete error:", error);
      message.error("Không thể xóa nhân viên");
    } finally {
      setLoading(false);
    }
  };

  /**
   * ✅ Check if can edit/delete employee
   */
  const canManageEmployee = (employee) => {
    const empRoles = employee.roles.map((r) =>
      typeof r === "string" ? r : r.name
    );

    // ✅ ADMIN can manage everyone except other ADMINs
    if (isAdmin) {
      return !empRoles.includes("ADMIN");
    }

    // ✅ MANAGER can only manage EMPLOYEEs
    if (currentUserRole === "MANAGER") {
      return (
        empRoles.includes("EMPLOYEE") &&
        !empRoles.includes("MANAGER") &&
        !empRoles.includes("ADMIN")
      );
    }

    return false;
  };

  /**
   * ✅ Get role badge color
   */
  const getRoleColor = (role) => {
    const colors = {
      ADMIN: "red",
      MANAGER: "orange",
      EMPLOYEE: "blue",
    };
    return colors[role] || "default";
  };

  /**
   * ✅ Table columns
   */
  const columns = [
    {
      title: "Mã NV",
      dataIndex: "id",
      key: "id", // ✅ ADD key
      width: 100,
    },
    {
      title: "Họ và tên",
      key: "fullName", // ✅ ADD key
      render: (_, record) => (
        <div>
          <div className="fw-bold">
            {record.firstName} {record.lastName}
          </div>
          <small style={{ color: "#6b7280" }}>{record.email}</small>
        </div>
      ),
    },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
      width: 150,
      render: (text) => text || <Tag>Chưa có tài khoản</Tag>,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 200,
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
      width: 150,
    },
    {
      title: "Vai trò",
      dataIndex: "roles",
      key: "roles",
      width: 150,
      render: (roles) => (
        <>
          {roles.map((role) => {
            const roleName = typeof role === "string" ? role : role.name;
            return (
              <Tag key={roleName} color={getRoleColor(roleName)}>
                {roleName}
              </Tag>
            );
          })}
        </>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 150,
      render: (_, record) => {
        const canManage = canManageEmployee(record);

        return (
          <Space>
            {canManage && (
              <Button
                type="link"
                icon={<EditOutlined />}
                onClick={() => handleOpenModal("edit", record)}
              >
                Sửa
              </Button>
            )}

            {canManage && (
              <Popconfirm
                title="Xác nhận xóa nhân viên?"
                description="Hành động này không thể hoàn tác."
                onConfirm={() => handleDelete(record)}
                okText="Xóa"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
              >
                <Button type="link" danger icon={<DeleteOutlined />}>
                  Xóa
                </Button>
              </Popconfirm>
            )}

            {!canManage && <Tag color="gold">Không có quyền</Tag>}
          </Space>
        );
      },
    },
  ];

  /**
   * ✅ Get available roles for current user
   */
  const getAvailableRoles = () => {
    if (isAdmin) {
      return [
        { value: "EMPLOYEE", label: "Employee" },
        { value: "MANAGER", label: "Manager" },
      ];
    }

    if (currentUserRole === "MANAGER") {
      return [{ value: "EMPLOYEE", label: "Employee" }];
    }

    return [];
  };

  return (
    <div className="employees-page">
      <div className="page-header">
        <div>
          <h1>Quản lý nhân viên</h1>
          <p className="page-subtitle">
            Quản lý thông tin nhân viên và phân quyền
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
          placeholder="Tìm kiếm nhân viên..."
          prefix={<FiSearch />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ maxWidth: 400 }}
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

      {/* Create/Edit Modal */}
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
        okText={modalMode === "create" ? "Tạo" : "Cập nhật"}
        cancelText="Hủy"
        width={600}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="firstName"
            label="Tên"
            rules={[{ required: true, message: "Vui lòng nhập tên" }]}
          >
            <Input placeholder="Nhập tên" />
          </Form.Item>

          <Form.Item
            name="lastName"
            label="Họ"
            rules={[{ required: true, message: "Vui lòng nhập họ" }]}
          >
            <Input placeholder="Nhập họ" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Vui lòng nhập email" },
              { type: "email", message: "Email không hợp lệ" },
            ]}
          >
            <Input placeholder="example@cinema.com" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[
              { required: true, message: "Vui lòng nhập số điện thoại" },
              { min: 10, message: "Số điện thoại phải có ít nhất 10 số" },
            ]}
          >
            <Input placeholder="0123456789" />
          </Form.Item>

          {modalMode === "create" && (
            <>
              <Form.Item
                name="username"
                label="Username"
                rules={[
                  { required: true, message: "Vui lòng nhập username" },
                  { min: 3, message: "Username phải có ít nhất 3 ký tự" },
                ]}
              >
                <Input placeholder="username" />
              </Form.Item>

              <Form.Item
                name="password"
                label="Mật khẩu"
                rules={[
                  { required: true, message: "Vui lòng nhập mật khẩu" },
                  { min: 6, message: "Mật khẩu phải có ít nhất 8 ký tự" },
                ]}
              >
                <Input.Password placeholder="Nhập mật khẩu" />
              </Form.Item>
            </>
          )}

          {modalMode === "edit" && (
            <Form.Item
              name="password"
              label="Mật khẩu mới (để trống nếu không đổi)"
            >
              <Input.Password placeholder="Nhập mật khẩu mới" />
            </Form.Item>
          )}

          <Form.Item
            name="roles"
            label="Vai trò"
            rules={[
              { required: true, message: "Vui lòng chọn ít nhất một vai trò" },
            ]}
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
