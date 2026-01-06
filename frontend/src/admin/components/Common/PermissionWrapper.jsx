const PermissionWrapper = ({ allowedRoles, children }) => {
  const { role } = JSON.parse(localStorage.getItem("user"));

  if (!allowedRoles.includes(role)) return null;
  return children;
};

// Sử dụng trong trang quản lý phim
<PermissionWrapper allowedRoles={["admin"]}>
  <button className="delete-btn">Xóa phim</button>
</PermissionWrapper>;
