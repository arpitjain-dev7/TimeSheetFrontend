import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  useMediaQuery,
  useTheme,
  Skeleton,
  Tooltip,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AddIcon from "@mui/icons-material/Add";
import FolderSpecialIcon from "@mui/icons-material/FolderSpecial";
import FilterListIcon from "@mui/icons-material/FilterList";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import StatusBadge from "../components/timesheet/StatusBadge";
import { useAuth } from "../context/AuthContext";
import { getMyProjects } from "../services/api";
import { getMyTimesheets } from "../api/timesheetApi";
import toast from "react-hot-toast";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Format ISO date string to dd/MM/yyyy */
const formatDate = (d) => {
  if (!d) return "—";
  const dt = new Date(d);
  if (isNaN(dt)) return d;
  return dt.toLocaleDateString("en-GB"); // dd/MM/yyyy
};

const STATUS_OPTIONS = ["DRAFT", "SUBMITTED", "APPROVED", "REJECTED"];

// ─── Main Component ───────────────────────────────────────────────────────────
const UserDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  // Data
  const [myProjects, setMyProjects] = useState([]);
  const [timesheets, setTimesheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projectsLoading, setProjectsLoading] = useState(true);

  // Filters — driven by URL ?status= param
  const [filterStatus, setFilterStatus] = useState("");

  // Sync filterStatus from URL when it changes
  useEffect(() => {
    const statusFromUrl = searchParams.get("status") || "";
    setFilterStatus(statusFromUrl);
  }, [searchParams]);

  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  // Fetch assigned projects
  const fetchMyProjects = async () => {
    setProjectsLoading(true);
    try {
      const res = await getMyProjects();
      const data = res.data;
      setMyProjects(Array.isArray(data) ? data : data?.projects || []);
    } catch {
      toast.error("Failed to load assigned projects.");
    } finally {
      setProjectsLoading(false);
    }
  };

  // Fetch timesheets using the correct GET /api/timesheets/my endpoint
  const fetchTimesheets = async () => {
    setLoading(true);
    try {
      const res = await getMyTimesheets(0, 20);
      setTimesheets(res.data?.timesheets || []);
    } catch {
      toast.error("Failed to load timesheets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProjects();
    fetchTimesheets();
  }, []);

  // Client-side status filter
  const filtered = useMemo(() => {
    if (!filterStatus) return timesheets;
    return timesheets.filter((t) => t.status === filterStatus);
  }, [timesheets, filterStatus]);

  const openTimesheets = () => navigate("/timesheets");

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f0f4f8" }}>
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isMobile={isMobile}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: 0,
          transition: "margin-left 0.25s ease",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Navbar
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          sidebarOpen={sidebarOpen}
        />

        <Box
          sx={{
            pt: { xs: 8, sm: 9 },
            px: { xs: 1.5, sm: 2 },
            pb: 4,
            flexGrow: 1,
          }}
        >
          {/* ── Add Timesheet card ── */}
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
              border: "1px solid rgba(0,0,0,0.06)",
              mb: 3,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              {/* Title row */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 2.5,
                  flexWrap: "wrap",
                  gap: 1.5,
                }}
              >
                <Typography variant="h6" fontWeight={700}>
                  Add Time Sheet
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate("/timesheets")}
                  sx={{
                    borderRadius: 2,
                    fontWeight: 700,
                    background: "linear-gradient(90deg,#1976d2,#42a5f5)",
                    "&:hover": {
                      background: "linear-gradient(90deg,#1565c0,#2196f3)",
                    },
                  }}
                >
                  Add Timesheet
                </Button>
              </Box>

              {/* Assigned Projects */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  flexWrap: "wrap",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <FolderSpecialIcon sx={{ color: "#1565c0", fontSize: 18 }} />
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    color="text.secondary"
                    sx={{ whiteSpace: "nowrap" }}
                  >
                    Assigned Projects
                  </Typography>
                </Box>
                {projectsLoading ? (
                  <CircularProgress size={18} />
                ) : myProjects.length === 0 ? (
                  <Typography variant="body2" color="text.disabled">
                    No projects assigned yet
                  </Typography>
                ) : (
                  myProjects.map((p) => (
                    <Button
                      key={p.id}
                      variant="outlined"
                      size="small"
                      onClick={() => navigate("/timesheets")}
                      sx={{
                        borderRadius: 2,
                        fontWeight: 700,
                        fontSize: 12,
                        textTransform: "none",
                        borderColor: "#1976d2",
                        color: "#1565c0",
                        px: 2,
                        "&:hover": {
                          bgcolor: "#1565c0",
                          color: "#fff",
                          borderColor: "#1565c0",
                        },
                        transition: "all 0.2s",
                      }}
                    >
                      {p.name}
                    </Button>
                  ))
                )}
              </Box>
            </CardContent>
          </Card>

          {/* ── Timesheet List card ── */}
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
              border: "1px solid rgba(0,0,0,0.06)",
            }}
          >
            <CardContent sx={{ p: 0 }}>
              {/* Card header */}
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
                <Typography variant="h6" fontWeight={700}>
                  Time Sheet List
                </Typography>
                {!loading && (
                  <Chip
                    label={`${filtered.length} entr${filtered.length !== 1 ? "ies" : "y"}`}
                    size="small"
                    sx={{
                      bgcolor: "#e3f2fd",
                      color: "#1565c0",
                      fontWeight: 700,
                    }}
                  />
                )}
              </Box>

              {/* ── Filter row ── */}
              <Box
                sx={{
                  px: 3,
                  py: 2,
                  borderBottom: "1px solid rgba(0,0,0,0.06)",
                  bgcolor: "#fafbfc",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 2,
                  alignItems: "center",
                }}
              >
                <FilterListIcon fontSize="small" color="action" />
                <Typography
                  variant="body2"
                  fontWeight={600}
                  color="text.secondary"
                >
                  Filter by status:
                </Typography>
                {["", ...STATUS_OPTIONS].map((s) => (
                  <Chip
                    key={s || "all"}
                    label={s || "All"}
                    size="small"
                    onClick={() => setFilterStatus(s)}
                    sx={{
                      fontWeight: 700,
                      cursor: "pointer",
                      bgcolor:
                        filterStatus === s ? "#1a237e" : "rgba(0,0,0,0.06)",
                      color: filterStatus === s ? "#fff" : "text.secondary",
                      "&:hover": {
                        bgcolor:
                          filterStatus === s ? "#283593" : "rgba(0,0,0,0.1)",
                      },
                    }}
                  />
                ))}
              </Box>

              {/* ── Table ── */}
              <TableContainer
                component={Paper}
                elevation={0}
                sx={{ borderRadius: 0 }}
              >
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#eef3fb" }}>
                      {[
                        "#",
                        "Title",
                        "Period",
                        "Total Hrs",
                        "Entries",
                        "Status",
                        "Action",
                      ].map((h) => (
                        <TableCell
                          key={h}
                          align={h === "Action" ? "center" : "left"}
                          sx={{
                            fontWeight: 700,
                            color: "#475569",
                            fontSize: 12,
                            py: 1.5,
                            textTransform: "uppercase",
                            letterSpacing: 0.5,
                          }}
                        >
                          {h}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {loading &&
                      [...Array(5)].map((_, i) => (
                        <TableRow key={i}>
                          {[...Array(7)].map((__, j) => (
                            <TableCell key={j}>
                              <Skeleton variant="text" width="80%" />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}

                    {!loading && filtered.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          align="center"
                          sx={{ py: 8, color: "text.secondary" }}
                        >
                          <Typography variant="body1" fontWeight={500}>
                            No timesheets found
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ mt: 0.5, color: "text.disabled" }}
                          >
                            Go to &quot;My Timesheets&quot; to create one.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}

                    {!loading &&
                      filtered.map((t, idx) => {
                        const periodStart = t.periodStart
                          ? formatDate(t.periodStart)
                          : "Not set";
                        const periodEnd = t.periodEnd
                          ? formatDate(t.periodEnd)
                          : "Not set";
                        return (
                          <TableRow
                            key={t.id}
                            sx={{
                              "&:hover": { bgcolor: "#f8fafc" },
                              transition: "background 0.15s",
                            }}
                          >
                            <TableCell
                              sx={{
                                color: "text.disabled",
                                fontFamily: "monospace",
                                fontSize: 12,
                              }}
                            >
                              #{t.id}
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600, maxWidth: 160 }}>
                              <Typography
                                variant="body2"
                                fontWeight={600}
                                noWrap
                              >
                                {t.title || `Timesheet #${t.id}`}
                              </Typography>
                            </TableCell>
                            <TableCell
                              sx={{
                                color: "text.secondary",
                                fontSize: 12,
                                whiteSpace: "nowrap",
                              }}
                            >
                              {periodStart}{" "}
                              {t.periodStart || t.periodEnd ? "to" : ""}{" "}
                              {periodEnd}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={`${Number(t.totalHours || 0).toFixed(1)} hrs`}
                                size="small"
                                sx={{
                                  bgcolor: "#ede7f6",
                                  color: "#6a1b9a",
                                  fontWeight: 700,
                                  fontSize: 11,
                                }}
                              />
                            </TableCell>
                            <TableCell
                              sx={{ color: "text.secondary", fontSize: 12 }}
                            >
                              {(t.entries || []).length}{" "}
                              {(t.entries || []).length === 1
                                ? "entry"
                                : "entries"}
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={t.status} />
                            </TableCell>
                            <TableCell align="center">
                              <Tooltip title="View timesheet">
                                <span>
                                  <VisibilityIcon
                                    fontSize="small"
                                    sx={{
                                      color: "#1976d2",
                                      cursor: "pointer",
                                      "&:hover": { color: "#1565c0" },
                                    }}
                                    onClick={() =>
                                      navigate(`/timesheets/${t.id}`)
                                    }
                                  />
                                </span>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        );
                      })}
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

export default UserDashboard;
