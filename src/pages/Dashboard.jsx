import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
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
  Button,
  IconButton,
  Tooltip,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import CancelIcon from "@mui/icons-material/Cancel";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import VisibilityIcon from "@mui/icons-material/Visibility";
import RefreshIcon from "@mui/icons-material/Refresh";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import StatusBadge from "../components/timesheet/StatusBadge";
import { useAuth } from "../context/AuthContext";
import { filterTimesheets } from "../api/timesheetApi";
import { getUsers } from "../services/api";

//  Helpers 

const formatDate = (d) => {
  if (!d) return "Not set";
  try {
    const str = d.includes("T") ? d : `${d}T00:00:00`;
    return format(parseISO(str), "dd MMM yyyy");
  } catch {
    return d;
  }
};

//  Stat Card 

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

//  Main Dashboard 

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  const [dataLoading, setDataLoading] = useState(true);
  const [recentTimesheets, setRecentTimesheets] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    submitted: 0,
    rejected: 0,
    users: 0,
  });

  const SIDEBAR_WIDTH = sidebarOpen ? 240 : 72;

  useEffect(() => { setSidebarOpen(!isMobile); }, [isMobile]);

  const loadDashboard = async () => {
    setDataLoading(true);
    try {
      // Parallel fetch: counts for each status + recent 10 timesheets + user count
      const [totalRes, approvedRes, submittedRes, rejectedRes, recentRes, usersRes] =
        await Promise.allSettled([
          filterTimesheets({}, 0, 1),
          filterTimesheets({ status: "APPROVED" }, 0, 1),
          filterTimesheets({ status: "SUBMITTED" }, 0, 1),
          filterTimesheets({ status: "REJECTED" }, 0, 1),
          filterTimesheets({}, 0, 10),
          getUsers({ page: 0, size: 1 }),
        ]);

      const getCount = (res) =>
        res.status === "fulfilled" ? (res.value.data?.totalPages ?? 0) : 0;

      setStats({
        total: getCount(totalRes),
        approved: getCount(approvedRes),
        submitted: getCount(submittedRes),
        rejected: getCount(rejectedRes),
        users:
          usersRes.status === "fulfilled"
            ? (usersRes.value.data?.users?.length ?? 0)
            : 0,
      });

      if (recentRes.status === "fulfilled") {
        setRecentTimesheets(recentRes.value.data?.timesheets || []);
      }
    } catch {
      // individual errors are handled by allSettled; nothing more needed
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []); // eslint-disable-line

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f0f4f8" }}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} isMobile={isMobile} />

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
        <Navbar onToggleSidebar={() => setSidebarOpen((p) => !p)} sidebarOpen={sidebarOpen} />

        <Box sx={{ pt: { xs: 8, sm: 9 }, px: { xs: 2, sm: 3 }, pb: 4, flexGrow: 1 }}>
          {/* Welcome banner */}
          <Box
            sx={{
              mb: 3,
              p: 3,
              borderRadius: 3,
              background: "linear-gradient(135deg,#1a237e 0%,#283593 60%,#01579b 100%)",
              color: "#fff",
              boxShadow: "0 8px 32px rgba(26,35,126,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <TrendingUpIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  Welcome back, {user?.username || user?.email || "Admin"}! 
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.75, mt: 0.25 }}>
                  Here's a real-time overview of all timesheets.
                </Typography>
              </Box>
            </Box>
            <Tooltip title="Refresh dashboard">
              <IconButton
                onClick={loadDashboard}
                disabled={dataLoading}
                sx={{ color: "rgba(255,255,255,0.8)", "&:hover": { bgcolor: "rgba(255,255,255,0.12)" } }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>

          {dataLoading && (
            <LinearProgress sx={{ mb: 2, borderRadius: 1, bgcolor: "rgba(25,118,210,0.15)" }} />
          )}

          {/* Stat Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} lg={3}>
              <StatCard
                title="Total Timesheets"
                value={stats.total}
                icon={<AccessTimeIcon />}
                gradient="linear-gradient(135deg,#1565c0,#1976d2)"
                subtitle="All timesheets in the system"
                loading={dataLoading}
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <StatCard
                title="Approved"
                value={stats.approved}
                icon={<CheckCircleIcon />}
                gradient="linear-gradient(135deg,#2e7d32,#388e3c)"
                subtitle="Verified & signed off"
                loading={dataLoading}
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <StatCard
                title="Awaiting Review"
                value={stats.submitted}
                icon={<PendingActionsIcon />}
                gradient="linear-gradient(135deg,#e65100,#f57c00)"
                subtitle="Submitted, pending approval"
                loading={dataLoading}
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <StatCard
                title="Rejected"
                value={stats.rejected}
                icon={<CancelIcon />}
                gradient="linear-gradient(135deg,#b71c1c,#c62828)"
                subtitle="Returned for revision"
                loading={dataLoading}
              />
            </Grid>
          </Grid>

          {/* Recent Activity Table */}
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
              border: "1px solid rgba(0,0,0,0.06)",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                px: 3,
                py: 2.5,
                borderBottom: "1px solid rgba(0,0,0,0.06)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              <Typography variant="h6" fontWeight={700} color="text.primary">
                Recent Activity
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Chip
                  label={`Latest ${recentTimesheets.length} of ${stats.total}`}
                  size="small"
                  sx={{ bgcolor: "#e3f2fd", color: "#1565c0", fontWeight: 700 }}
                />
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => navigate("/manager/timesheets")}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 700,
                    fontSize: 12,
                    borderColor: "#3949ab",
                    color: "#3949ab",
                    "&:hover": { bgcolor: "rgba(57,73,171,0.06)" },
                  }}
                >
                  View All
                </Button>
              </Box>
            </Box>

            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 0 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f8fafc" }}>
                    {["ID", "Employee", "Title", "Period", "Status", "Total Hrs", "Actions"].map(
                      (h) => (
                        <TableCell
                          key={h}
                          sx={{
                            fontWeight: 700,
                            color: "text.secondary",
                            fontSize: 11,
                            textTransform: "uppercase",
                            letterSpacing: 0.5,
                            py: 1.5,
                          }}
                        >
                          {h}
                        </TableCell>
                      )
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dataLoading
                    ? [...Array(5)].map((_, i) => (
                        <TableRow key={i}>
                          {[...Array(7)].map((__, j) => (
                            <TableCell key={j}>
                              <Skeleton variant="text" width="80%" />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    : recentTimesheets.length === 0
                    ? (
                        <TableRow>
                          <TableCell colSpan={7} sx={{ textAlign: "center", py: 6 }}>
                            <Typography variant="body2" color="text.disabled">
                              No timesheets found.
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )
                    : recentTimesheets.map((ts) => (
                        <TableRow
                          key={ts.id}
                          sx={{
                            "&:hover": { bgcolor: "#f0f7ff" },
                            transition: "background 0.15s ease",
                          }}
                        >
                          <TableCell
                            sx={{ color: "text.disabled", fontFamily: "monospace", fontSize: 12 }}
                          >
                            #{ts.id}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>
                            {ts.username || "-"}
                          </TableCell>
                          <TableCell sx={{ maxWidth: 160 }}>
                            <Typography variant="body2" noWrap>
                              {ts.title || `Timesheet #${ts.id}`}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ whiteSpace: "nowrap", fontSize: 12, color: "text.secondary" }}>
                            {formatDate(ts.periodStart)} {"to"} {formatDate(ts.periodEnd)}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={ts.status} />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={`${Number(ts.totalHours || 0).toFixed(1)} hrs`}
                              size="small"
                              sx={{ bgcolor: "#ede7f6", color: "#6a1b9a", fontWeight: 700 }}
                            />
                          </TableCell>
                          <TableCell>
                            <Tooltip title="Review timesheet">
                              <IconButton
                                size="small"
                                onClick={() => navigate(`/manager/timesheets/${ts.id}`)}
                                sx={{
                                  color: "#3949ab",
                                  "&:hover": { bgcolor: "rgba(57,73,171,0.08)" },
                                }}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;