import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute, {
  AdminRoute,
  UserRoute,
} from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import UserDashboard from "./pages/UserDashboard";
import UserManagement from "./pages/UserManagement";
import Projects from "./pages/Projects";
import MyTimesheetsPage from "./pages/user/MyTimesheetsPage";
import TimesheetDetailPage from "./pages/user/TimesheetDetailPage";
import ManagerTimesheetsPage from "./pages/manager/ManagerTimesheetsPage";

/**
 * Renders the correct dashboard based on the logged-in user's role.
 * ROLE_USER → UserDashboard (timesheet entry)
 * ROLE_ADMIN / ROLE_MANAGER → Dashboard (analytics overview)
 */
const RoleDashboard = () => {
  const { user } = useAuth();
  const isUser =
    !user?.roles?.includes("ROLE_ADMIN") &&
    !user?.roles?.includes("ROLE_MANAGER");
  return isUser ? <UserDashboard /> : <Dashboard />;
};

/**
 * Root application component.
 * Sets up routing, authentication context, and global toast notifications.
 */
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* Global toast notification container */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: "12px",
              background: "#1e293b",
              color: "#f1f5f9",
              fontWeight: 500,
              boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
            },
            success: {
              iconTheme: { primary: "#4caf50", secondary: "#fff" },
            },
            error: {
              iconTheme: { primary: "#f44336", secondary: "#fff" },
            },
          }}
        />

        <Routes>
          {/* Redirect root to /dashboard (ProtectedRoute handles unauthenticated redirect) */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Public routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <RoleDashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin-only routes */}
          <Route
            path="/user-management"
            element={
              <AdminRoute>
                <UserManagement />
              </AdminRoute>
            }
          />
          <Route
            path="/projects"
            element={
              <AdminRoute>
                <Projects />
              </AdminRoute>
            }
          />

          {/* User-only: Timesheet list and detail */}
          <Route
            path="/timesheets"
            element={
              <UserRoute>
                <MyTimesheetsPage />
              </UserRoute>
            }
          />
          <Route
            path="/timesheets/:id"
            element={
              <UserRoute>
                <TimesheetDetailPage />
              </UserRoute>
            }
          />

          {/* Manager / Admin: all timesheets management */}
          <Route
            path="/manager/timesheets"
            element={
              <AdminRoute>
                <ManagerTimesheetsPage />
              </AdminRoute>
            }
          />

          {/* Catch-all – redirect unknown paths */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
