import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "./Loader";

/**
 * ProtectedRoute – wraps a component so only authenticated users can access it.
 * Redirects unauthenticated visitors to /login.
 */
const ProtectedRoute = ({ children }) => {
  const { accessToken, loading } = useAuth();

  // Wait until auth state has been restored from localStorage
  if (loading) return <Loader />;

  return accessToken ? children : <Navigate to="/login" replace />;
};

/**
 * AdminRoute – allows access only to users with ROLE_ADMIN or ROLE_MANAGER.
 * Unauthenticated users are sent to /login.
 * Authenticated users without either role are sent to /dashboard.
 */
export const AdminRoute = ({ children }) => {
  const { user, accessToken, loading } = useAuth();

  if (loading) return <Loader />;
  if (!accessToken) return <Navigate to="/login" replace />;
  const roles = user?.roles || [];
  if (!roles.includes("ROLE_ADMIN") && !roles.includes("ROLE_MANAGER"))
    return <Navigate to="/dashboard" replace />;

  return children;
};

export default ProtectedRoute;
