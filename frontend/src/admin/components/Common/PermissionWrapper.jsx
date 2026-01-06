// frontend/src/admin/components/Common/PermissionWrapper.jsx
import { authService } from "../../../services";

/**
 * Wrapper component to show/hide content based on permissions
 * More flexible than route protection - can hide buttons, sections, etc.
 */
const PermissionWrapper = ({
  children,
  allowedRoles = [],
  requireAllRoles = false,
  fallback = null,
}) => {
  const userRoles = authService.getRoles();

  // ✅ No restriction → Show content
  if (allowedRoles.length === 0) {
    return children;
  }

  // ✅ Require ALL roles (AND logic)
  if (requireAllRoles) {
    const hasAllRoles = allowedRoles.every((role) => userRoles.includes(role));
    return hasAllRoles ? children : fallback;
  }

  // ✅ Require ANY role (OR logic) - Default
  const hasAnyRole = allowedRoles.some((role) => userRoles.includes(role));
  return hasAnyRole ? children : fallback;
};

export default PermissionWrapper;

/**
 * Usage examples:
 *
 * // Only ADMIN can see
 * <PermissionWrapper allowedRoles={["ADMIN"]}>
 *   <button>Delete All</button>
 * </PermissionWrapper>
 *
 * // MANAGER or ADMIN can see
 * <PermissionWrapper allowedRoles={["ADMIN", "MANAGER"]}>
 *   <button>Manage Employees</button>
 * </PermissionWrapper>
 *
 * // EMPLOYEE, MANAGER, or ADMIN can see
 * <PermissionWrapper allowedRoles={["ADMIN", "MANAGER", "EMPLOYEE"]}>
 *   <div>Movie Management</div>
 * </PermissionWrapper>
 *
 * // With fallback
 * <PermissionWrapper
 *   allowedRoles={["ADMIN"]}
 *   fallback={<p>You don't have permission</p>}
 * >
 *   <SecretPanel />
 * </PermissionWrapper>
 */
