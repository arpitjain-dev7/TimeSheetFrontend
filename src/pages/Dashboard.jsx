import { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  LinearProgress,
  useMediaQuery,
  useTheme,
  Skeleton,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";

// ─── Sample data (replace with real API calls) ────────────────────────────────
const SAMPLE_TIMESHEETS = [
  {
    id: 1,
    project: "Project Alpha",
    date: "2026-03-25",
    hours: 8,
    status: "Approved",
  },
  {
    id: 2,
    project: "Project Beta",
    date: "2026-03-26",
    hours: 6.5,
    status: "Pending",
  },
  {
    id: 3,
    project: "Project Gamma",
    date: "2026-03-27",
    hours: 7,
    status: "Approved",
  },
  {
    id: 4,
    project: "Internal Meeting",
    date: "2026-03-28",
    hours: 2,
    status: "Pending",
  },
  {
    id: 5,
    project: "Project Delta",
    date: "2026-03-31",
    hours: 8,
    status: "Approved",
  },
  {
    id: 6,
    project: "Project Alpha",
    date: "2026-04-01",
    hours: 5,
    status: "Pending",
  },
];

// ─── Stat Card Component ──────────────────────────────────────────────────────
const StatCard = ({ title, value, icon, gradient, subtitle, loading }) => (
  <Card
    elevation={0}
    sx={{
      borderRadius: 3,
      background: gradient,
      color: "#fff",
      boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
      transition: "transform 0.25s ease, box-shadow 0.25s ease",
      "&:hover": {
        transform: "translateY(-4px)",
        boxShadow: "0 16px 48px rgba(0,0,0,0.25)",
      },
    }}
  >
    <CardContent sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Box>
          <Typography variant="body2" sx={{ opacity: 0.8, mb: 0.5 }}>
            {title}
          </Typography>
          {loading ? (
            <Skeleton
              variant="text"
              width={60}
              height={48}
              sx={{ bgcolor: "rgba(255,255,255,0.2)" }}
            />
          ) : (
            <Typography variant="h3" fontWeight={800}>
              {value}
            </Typography>
          )}
        </Box>
        <Avatar
          sx={{
            bgcolor: "rgba(255,255,255,0.2)",
            width: 56,
            height: 56,
            backdropFilter: "blur(4px)",
          }}
        >
          {icon}
        </Avatar>
      </Box>
      <Typography variant="caption" sx={{ opacity: 0.75 }}>
        {subtitle}
      </Typography>
    </CardContent>
  </Card>
);

// ─── Status chip helper ───────────────────────────────────────────────────────
const StatusChip = ({ status }) => (
  <Chip
    label={status}
    size="small"
    icon={
      status === "Approved" ? (
        <CheckCircleIcon style={{ fontSize: 14 }} />
      ) : (
        <PendingActionsIcon style={{ fontSize: 14 }} />
      )
    }
    sx={{
      fontWeight: 700,
      fontSize: 11,
      bgcolor:
        status === "Approved" ? "rgba(76,175,80,0.15)" : "rgba(255,152,0,0.15)",
      color: status === "Approved" ? "#2e7d32" : "#e65100",
      border: `1px solid ${status === "Approved" ? "#81c784" : "#ffb74d"}`,
    }}
  />
);

// ─── Main Dashboard Component ─────────────────────────────────────────────────
const Dashboard = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [dataLoading, setDataLoading] = useState(true);
  const [timesheets, setTimesheets] = useState([]);

  // Simulate API fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      setTimesheets(SAMPLE_TIMESHEETS);
      setDataLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // Auto-collapse sidebar on mobile when viewport changes
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  const totalTimesheets = timesheets.length;
  const approvedCount = timesheets.filter(
    (t) => t.status === "Approved",
  ).length;
  const pendingCount = timesheets.filter((t) => t.status === "Pending").length;
  const totalHours = timesheets.reduce((sum, t) => sum + t.hours, 0);

  const SIDEBAR_WIDTH = sidebarOpen ? 240 : 72;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f0f4f8" }}>
      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isMobile={isMobile}
      />

      {/* Main content area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: isMobile ? 0 : `${SIDEBAR_WIDTH}px`,
          transition: "margin-left 0.25s ease",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Navbar */}
        <Navbar
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          sidebarOpen={sidebarOpen}
        />

        {/* Page content below the AppBar */}
        <Box
          sx={{
            pt: { xs: 8, sm: 9 },
            px: { xs: 2, sm: 3 },
            pb: 4,
            flexGrow: 1,
          }}
        >
          {/* Welcome banner */}
          <Box
            sx={{
              mb: 3,
              p: 3,
              borderRadius: 3,
              background:
                "linear-gradient(135deg,#1a237e 0%,#283593 60%,#01579b 100%)",
              color: "#fff",
              boxShadow: "0 8px 32px rgba(26,35,126,0.25)",
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <TrendingUpIcon sx={{ fontSize: 40, opacity: 0.8 }} />
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Welcome back, {user?.username || user?.email || "User"}! 👋
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.75, mt: 0.25 }}>
                Here's your timesheet overview for this month.
              </Typography>
            </Box>
          </Box>

          {/* Loading progress bar */}
          {dataLoading && (
            <LinearProgress
              sx={{ mb: 2, borderRadius: 1, bgcolor: "rgba(25,118,210,0.15)" }}
            />
          )}

          {/* Stat Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} lg={3}>
              <StatCard
                title="Total Timesheets"
                value={totalTimesheets}
                icon={<AccessTimeIcon />}
                gradient="linear-gradient(135deg,#1565c0,#1976d2)"
                subtitle="All submitted entries"
                loading={dataLoading}
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <StatCard
                title="Approved"
                value={approvedCount}
                icon={<CheckCircleIcon />}
                gradient="linear-gradient(135deg,#2e7d32,#388e3c)"
                subtitle="Verified & signed off"
                loading={dataLoading}
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <StatCard
                title="Pending"
                value={pendingCount}
                icon={<PendingActionsIcon />}
                gradient="linear-gradient(135deg,#e65100,#f57c00)"
                subtitle="Awaiting approval"
                loading={dataLoading}
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <StatCard
                title="Total Hours"
                value={`${totalHours}h`}
                icon={<TrendingUpIcon />}
                gradient="linear-gradient(135deg,#6a1b9a,#8e24aa)"
                subtitle="Logged this month"
                loading={dataLoading}
              />
            </Grid>
          </Grid>

          {/* Recent Timesheets Table */}
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
              border: "1px solid rgba(0,0,0,0.06)",
            }}
          >
            <CardContent sx={{ p: 0 }}>
              {/* Table header */}
              <Box
                sx={{
                  px: 3,
                  py: 2.5,
                  borderBottom: "1px solid rgba(0,0,0,0.06)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography variant="h6" fontWeight={700} color="text.primary">
                  Recent Activity
                </Typography>
                <Chip
                  label={`${totalTimesheets} entries`}
                  size="small"
                  sx={{ bgcolor: "#e3f2fd", color: "#1565c0", fontWeight: 700 }}
                />
              </Box>

              <TableContainer
                component={Paper}
                elevation={0}
                sx={{ borderRadius: 0 }}
              >
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#f8fafc" }}>
                      {["#", "Project", "Date", "Hours", "Status"].map((h) => (
                        <TableCell
                          key={h}
                          sx={{
                            fontWeight: 700,
                            color: "text.secondary",
                            fontSize: 12,
                            py: 1.5,
                          }}
                        >
                          {h}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dataLoading
                      ? [...Array(5)].map((_, i) => (
                          <TableRow key={i}>
                            {[...Array(5)].map((__, j) => (
                              <TableCell key={j}>
                                <Skeleton variant="text" width="80%" />
                              </TableCell>
                            ))}
                          </TableRow>
                        ))
                      : timesheets.map((row) => (
                          <TableRow
                            key={row.id}
                            sx={{
                              "&:hover": { bgcolor: "#f0f7ff" },
                              transition: "background 0.15s ease",
                            }}
                          >
                            <TableCell
                              sx={{ color: "text.disabled", fontWeight: 600 }}
                            >
                              #{row.id}
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>
                              {row.project}
                            </TableCell>
                            <TableCell sx={{ color: "text.secondary" }}>
                              {row.date}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={`${row.hours}h`}
                                size="small"
                                sx={{
                                  bgcolor: "#ede7f6",
                                  color: "#6a1b9a",
                                  fontWeight: 700,
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <StatusChip status={row.status} />
                            </TableCell>
                          </TableRow>
                        ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
