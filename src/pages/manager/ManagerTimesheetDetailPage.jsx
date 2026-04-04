import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
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
  CircularProgress,
  Chip,
  Divider,
  Grid,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PersonIcon from "@mui/icons-material/Person";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import StatusBadge from "../../components/timesheet/StatusBadge";
import RejectModal from "../../components/timesheet/RejectModal";
import { getTimesheetById, approveTimesheet } from "../../api/timesheetApi";
import toast from "react-hot-toast";

const formatDate = (d) => {
  if (!d) return "Not set";
  try {
    const str = d.includes("T") ? d : `${d}T00:00:00`;
    return format(parseISO(str), "dd MMM yyyy");
  } catch {
    return d;
  }
};

const MetaCard = ({ icon, label, value, highlight }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 1.5,
      p: 2,
      borderRadius: 2,
      bgcolor: highlight ? "rgba(26,35,126,0.06)" : "grey.50",
      border: "1px solid",
      borderColor: highlight ? "rgba(26,35,126,0.15)" : "grey.200",
    }}
  >
    <Box
      sx={{
        width: 36,
        height: 36,
        borderRadius: "50%",
        bgcolor: highlight ? "rgba(26,35,126,0.12)" : "rgba(0,0,0,0.05)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {icon}
    </Box>
    <Box>
      <Typography
        variant="caption"
        color="text.disabled"
        fontWeight={600}
        sx={{ textTransform: "uppercase", letterSpacing: 0.5, display: "block" }}
      >
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={highlight ? 700 : 500} color={highlight ? "#1a237e" : "text.primary"}>
        {value}
      </Typography>
    </Box>
  </Box>
);

const ManagerTimesheetDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  const [timesheet, setTimesheet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);

  const SIDEBAR_WIDTH = sidebarOpen ? 240 : 72;

  useEffect(() => { setSidebarOpen(!isMobile); }, [isMobile]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getTimesheetById(id);
      setTimesheet(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load timesheet");
      navigate("/manager/timesheets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]); // eslint-disable-line

  const handleApprove = async () => {
    setApprovingId(id);
    try {
      const res = await approveTimesheet(id);
      setTimesheet(res.data);
      toast.success("Timesheet approved!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to approve timesheet");
    } finally {
      setApprovingId(null);
    }
  };

  const entries = timesheet?.entries || [];
  const isSubmitted = timesheet?.status === "SUBMITTED";

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
          {/* Back button */}
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/manager/timesheets")}
            sx={{ mb: 2.5, borderRadius: 2, color: "text.secondary", textTransform: "none" }}
          >
            Back to Team Timesheets
          </Button>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 12 }}>
              <CircularProgress size={48} />
            </Box>
          ) : !timesheet ? null : (
            <>
              {/*  Header Card  */}
              <Card
                elevation={0}
                sx={{
                  mb: 3,
                  borderRadius: 3,
                  overflow: "hidden",
                  border: "1px solid rgba(26,35,126,0.15)",
                  boxShadow: "0 4px 20px rgba(26,35,126,0.1)",
                }}
              >
                {/* Gradient banner */}
                <Box
                  sx={{
                    background: "linear-gradient(135deg,#1a237e 0%,#283593 60%,#01579b 100%)",
                    px: 3,
                    py: 2.5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 2,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: "50%",
                        bgcolor: "rgba(255,255,255,0.15)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <AssignmentIcon sx={{ color: "#fff", fontSize: 26 }} />
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight={700} color="#fff" lineHeight={1.25}>
                        {timesheet.title || `Timesheet #${timesheet.id}`}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.75)" }}>
                        Reviewing timesheet #{timesheet.id}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <StatusBadge status={timesheet.status} />
                    {isSubmitted && (
                      <>
                        <Button
                          onClick={handleApprove}
                          disabled={!!approvingId}
                          variant="contained"
                          size="small"
                          startIcon={approvingId ? <CircularProgress size={12} color="inherit" /> : <CheckCircleIcon />}
                          sx={{
                            borderRadius: 2,
                            fontWeight: 700,
                            textTransform: "none",
                            bgcolor: "rgba(255,255,255,0.2)",
                            color: "#fff",
                            border: "1px solid rgba(255,255,255,0.35)",
                            "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
                          }}
                        >
                          {approvingId ? "Approving..." : "Approve"}
                        </Button>
                        <Button
                          onClick={() => setShowRejectModal(true)}
                          variant="contained"
                          size="small"
                          startIcon={<CancelIcon />}
                          sx={{
                            borderRadius: 2,
                            fontWeight: 700,
                            textTransform: "none",
                            bgcolor: "rgba(211,47,47,0.75)",
                            color: "#fff",
                            border: "1px solid rgba(211,47,47,0.5)",
                            "&:hover": { bgcolor: "rgba(211,47,47,0.9)" },
                          }}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                  </Box>
                </Box>

                {/* Meta grid */}
                <CardContent sx={{ p: 3 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <MetaCard
                        icon={<PersonIcon sx={{ fontSize: 18, color: "#546e7a" }} />}
                        label="Employee"
                        value={timesheet.username || "Unknown"}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <MetaCard
                        icon={<CalendarTodayIcon sx={{ fontSize: 18, color: "#546e7a" }} />}
                        label="Period"
                        value={`${formatDate(timesheet.periodStart)} - ${formatDate(timesheet.periodEnd)}`}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <MetaCard
                        icon={<AccessTimeIcon sx={{ fontSize: 18, color: "#1a237e" }} />}
                        label="Total Hours"
                        value={`${Number(timesheet.totalHours || 0).toFixed(1)} hrs`}
                        highlight
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <MetaCard
                        icon={<AssignmentIcon sx={{ fontSize: 18, color: "#546e7a" }} />}
                        label="Submitted At"
                        value={timesheet.submittedAt ? formatDate(timesheet.submittedAt) : "Not submitted"}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/*  Entries Table  */}
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "grey.200",
                  overflow: "hidden",
                }}
              >
                {/* Table header */}
                <Box
                  sx={{
                    px: 3,
                    py: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderBottom: "1px solid",
                    borderColor: "grey.100",
                  }}
                >
                  <Typography variant="subtitle2" fontWeight={700}>
                    Work Entries
                  </Typography>
                  <Chip
                    label={`${entries.length} ${entries.length === 1 ? "entry" : "entries"}`}
                    size="small"
                    sx={{ bgcolor: "rgba(26,35,126,0.08)", color: "#1a237e", fontWeight: 700 }}
                  />
                </Box>

                {entries.length === 0 ? (
                  <Box sx={{ textAlign: "center", py: 8 }}>
                    <Typography variant="body2" color="text.disabled">
                      No entries logged in this timesheet.
                    </Typography>
                  </Box>
                ) : (
                  <TableContainer component={Paper} elevation={0}>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: "grey.50" }}>
                        <TableRow>
                          {["Project", "Code", "Date", "Hours", "Description"].map((h) => (
                            <TableCell
                              key={h}
                              sx={{
                                fontWeight: 700,
                                fontSize: 11,
                                textTransform: "uppercase",
                                letterSpacing: 0.5,
                                color: "text.disabled",
                              }}
                            >
                              {h}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {entries.map((entry) => {
                          const formattedDate = entry.workDate
                            ? (() => { try { return format(parseISO(entry.workDate), "dd MMM yyyy"); } catch { return entry.workDate; } })()
                            : "Not set";
                          return (
                            <TableRow key={entry.id} hover>
                              <TableCell sx={{ fontWeight: 500 }}>
                                {entry.projectName || "Not set"}
                              </TableCell>
                              <TableCell sx={{ color: "text.secondary", fontFamily: "monospace", fontSize: 12 }}>
                                {entry.projectCode || "Not set"}
                              </TableCell>
                              <TableCell>{formattedDate}</TableCell>
                              <TableCell>
                                <Chip
                                  label={`${Number(entry.hoursWorked || 0).toFixed(1)} hrs`}
                                  size="small"
                                  sx={{
                                    bgcolor: "rgba(26,35,126,0.08)",
                                    color: "#1a237e",
                                    fontWeight: 700,
                                    fontSize: 11,
                                  }}
                                />
                              </TableCell>
                              <TableCell sx={{ color: "text.secondary", maxWidth: 240 }}>
                                <Typography variant="body2" noWrap title={entry.description}>
                                  {entry.description || "-"}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}

                {/* Footer summary */}
                {entries.length > 0 && (
                  <>
                    <Divider />
                    <Box sx={{ px: 3, py: 1.5, display: "flex", justifyContent: "flex-end" }}>
                      <Typography variant="body2" color="text.secondary">
                        Total:{" "}
                        <Typography component="span" fontWeight={700} color="#1a237e">
                          {Number(timesheet.totalHours || 0).toFixed(1)} hrs
                        </Typography>{" "}
                        across{" "}
                        <Typography component="span" fontWeight={600}>
                          {entries.length} {entries.length === 1 ? "entry" : "entries"}
                        </Typography>
                      </Typography>
                    </Box>
                  </>
                )}
              </Card>
            </>
          )}
        </Box>
      </Box>

      {showRejectModal && (
        <RejectModal
          timesheet={timesheet}
          onClose={() => setShowRejectModal(false)}
          onRejected={() => {
            setShowRejectModal(false);
            load();
          }}
        />
      )}
    </Box>
  );
};

export default ManagerTimesheetDetailPage;