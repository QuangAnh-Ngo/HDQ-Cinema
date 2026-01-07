import { authService } from "../../../services";

const PermissionWrapper = ({
  children,
  allowedRoles = [],
  requireAllRoles = false,
  fallback = null,
}) => {
  const userRoles = authService.getRoles();

  if (allowedRoles.length === 0) {
    return children;
  }

  if (requireAllRoles) {
    const hasAllRoles = allowedRoles.every((role) => userRoles.includes(role));
    return hasAllRoles ? children : fallback;
  }

  const hasAnyRole = allowedRoles.some((role) => userRoles.includes(role));
  return hasAnyRole ? children : fallback;
};

export default PermissionWrapper;
