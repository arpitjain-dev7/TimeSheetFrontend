import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  CircularProgress,
  Chip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import VisibilityIcon from "@mui/icons-material/Visibility";
import FilterListIcon from "@mui/icons-material/FilterList";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import StatusBadge from "../../components/timesheet/StatusBadge";
import RejectModal from "../../components/timesheet/RejectModal";
import Pagination from "../../components/shared/Pagination";
import { filterTimesheets, approveTimesheet } from "../../api/timesheetApi";
import toast from "react-hot-toast";

const STATUS_OPTIONS = ["DRAFT", "SUBMITTED", "APPROVED", "REJECTED"];

const formatDate = (d) => {
  if (!d) return "Not set";
  try {
    const str = d.includes("T") ? d : `${d}T00:00:00`;
    return format(parseISO(str), "dd MMM yyyy");
  } catch {
    return d;
  }
};

const EMPTY_FILTERS = {
  userId: "",
  projectId: "",
  dateFrom: "",
  dateTo: "",
  status: "",
};

const ManagerTimesheetsPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [searchParams] = useSearchParams();

  const [timesheets, setTimesheets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const navigate = useNavigate();

  // Pre-populate from ?status= query param (e.g. from sidebar Approved/Pending links)
  const statusFromUrl = searchParams.get("status") || "";
  const [filters, setFilters] = useState({
    ...EMPTY_FILTERS,
    status: statusFromUrl,
  });
  const [appliedFilters, setAppliedFilters] = useState(
    statusFromUrl ? { ...EMPTY_FILTERS, status: statusFromUrl } : {},
  );
  const [rejectTarget, setRejectTarget] = useState(null);
  const [approvingId, setApprovingId] = useState(null);

  const SIDEBAR_WIDTH = sidebarOpen ? 240 : 72;

  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  const buildParams = (f) => {
    const p = {};
    if (f.userId) p.userId = Number(f.userId);
    if (f.projectId) p.projectId = Number(f.projectId);
    if (f.dateFrom) p.dateFrom = f.dateFrom;
    if (f.dateTo) p.dateTo = f.dateTo;
    if (f.status) p.status = f.status;
    return p;
  };

  const fetchTimesheets = async (page = 0, active = appliedFilters) => {
    setLoading(true);
    try {
      const res = await filterTimesheets(buildParams(active), page);
      const data = res.data;
      setTimesheets(data.timesheets || []);
      setCurrentPage(data.currentPage ?? page);
      setTotalPages(data.totalPages ?? 1);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load timesheets");
    } finally {
      setLoading(false);
    }
  };

  // Re-run whenever the ?status= query param changes (sidebar navigation)
  useEffect(() => {
    const newStatus = searchParams.get("status") || "";
    const newFilters = newStatus ? { ...EMPTY_FILTERS, status: newStatus } : {};
    setFilters({ ...EMPTY_FILTERS, status: newStatus });
    setAppliedFilters(newFilters);
    setCurrentPage(0);
    fetchTimesheets(0, newFilters);
  }, [searchParams]); // eslint-disable-line

  const handleApplyFilters = () => {
    setAppliedFilters({ ...filters });
    setCurrentPage(0);
    fetchTimesheets(0, filters);
  };

  const handleClearFilters = () => {
    setFilters(EMPTY_FILTERS);
    setAppliedFilters({});
    setCurrentPage(0);
    fetchTimesheets(0, {});
  };

  const handleApprove = async (id) => {
    setApprovingId(id);
    try {
      await approveTimesheet(id);
      toast.success("Timesheet approved");
      fetchTimesheets(currentPage);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to approve timesheet");
    } finally {
      setApprovingId(null);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

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
          onToggleSidebar={() => setSidebarOpen((p) => !p)}
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
          {/* Page Banner */}
          <Box
            sx={{
              mb: 3,
              p: 3,
              borderRadius: 3,
              background:
                "linear-gradient(135deg,#1a237e 0%,#283593 60%,#01579b 100%)",
              color: "#fff",
              boxShadow: "0 8px 32px rgba(26,35,126,0.25)",
            }}
          >
            <Typography variant="h6" fontWeight={700}>
              {statusFromUrl === "APPROVED"
                ? "Approved Timesheets"
                : statusFromUrl === "SUBMITTED"
                  ? "Pending Timesheets"
                  : "Timesheet Management"}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.75, mt: 0.25 }}>
              {statusFromUrl === "APPROVED"
                ? "All timesheets that have been approved"
                : statusFromUrl === "SUBMITTED"
                  ? "All timesheets awaiting your review and approval"
                  : "Review, approve, and reject team timesheets"}
            </Typography>
          </Box>

          {/* â”€â”€ Filter Bar â”€â”€ */}
          <Card
            elevation={0}
            sx={{
              mb: 3,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "grey.200",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2.5 }}
              >
                <FilterListIcon fontSize="small" color="action" />
                <Typography variant="subtitle2" fontWeight={700}>
                  Filter Timesheets
                </Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4} lg={2}>
                  <TextField
                    label="User ID"
                    name="userId"
                    value={filters.userId}
                    onChange={handleFilterChange}
                    type="number"
                    size="small"
                    fullWidth
                    placeholder="e.g. 3"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={2}>
                  <TextField
                    label="Project ID"
                    name="projectId"
                    value={filters.projectId}
                    onChange={handleFilterChange}
                    type="number"
                    size="small"
                    fullWidth
                    placeholder="e.g. 2"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={2}>
                  <TextField
                    label="Date From"
                    name="dateFrom"
                    type="date"
                    value={filters.dateFrom}
                    onChange={handleFilterChange}
                    size="small"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={2}>
                  <TextField
                    label="Date To"
                    name="dateTo"
                    type="date"
                    value={filters.dateTo}
                    onChange={handleFilterChange}
                    size="small"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel shrink>Status</InputLabel>
                    <Select
                      name="status"
                      value={filters.status}
                      onChange={handleFilterChange}
                      displayEmpty
                      notched
                      label="Status"
                    >
                      <MenuItem value="">All Statuses</MenuItem>
                      {STATUS_OPTIONS.map((s) => (
                        <MenuItem key={s} value={s}>
                          {s}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Box sx={{ display: "flex", gap: 1.5, mt: 2.5 }}>
                <Button
                  onClick={handleApplyFilters}
                  variant="contained"
                  sx={{
                    borderRadius: 2,
                    fontWeight: 700,
                    textTransform: "none",
                  }}
                >
                  Apply Filters
                </Button>
                <Button
                  onClick={handleClearFilters}
                  variant="outlined"
                  sx={{ borderRadius: 2, textTransform: "none" }}
                >
                  Clear Filters
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* â”€â”€ Timesheets Table â”€â”€ */}
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "1px solid",
              borderColor: "grey.200",
              overflow: "hidden",
            }}
          >
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
                <CircularProgress size={40} />
              </Box>
            ) : timesheets.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 10 }}>
                <Typography variant="h4" sx={{ mb: 1 }}>
                  ðŸ“­
                </Typography>
                <Typography
                  variant="h6"
                  color="text.secondary"
                  fontWeight={600}
                >
                  No timesheets found
                </Typography>
                <Typography
                  variant="body2"
                  color="text.disabled"
                  sx={{ mt: 0.5 }}
                >
                  Try adjusting your filters
                </Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} elevation={0}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: "grey.50" }}>
                    <TableRow>
                      {[
                        "ID",
                        "User",
                        "Title",
                        "Period",
                        "Status",
                        "Total Hrs",
                        "Submitted At",
                        "Actions",
                      ].map((h) => (
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
                    {timesheets.map((ts) => (
                      <TableRow key={ts.id} hover>
                        <TableCell
                          sx={{
                            color: "text.disabled",
                            fontFamily: "monospace",
                            fontSize: 12,
                          }}
                        >
                          #{ts.id}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>
                          {ts.username}
                        </TableCell>
                        <TableCell sx={{ maxWidth: 160 }}>
                          <Typography variant="body2" noWrap>
                            {ts.title || `Timesheet #${ts.id}`}
                          </Typography>
                        </TableCell>
                        <TableCell
                          sx={{
                            whiteSpace: "nowrap",
                            fontSize: 12,
                            color: "text.secondary",
                          }}
                        >
                          {formatDate(ts.periodStart)} {"to"}{" "}
                          {formatDate(ts.periodEnd)}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={ts.status} />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>
                          {Number(ts.totalHours || 0).toFixed(1)} hrs
                        </TableCell>
                        <TableCell
                          sx={{ color: "text.secondary", fontSize: 12 }}
                        >
                          {ts.submittedAt
                            ? formatDate(ts.submittedAt)
                            : "Not set"}
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}
                          >
                            {/* Review – always visible */}
                            <Button
                              onClick={() =>
                                navigate(`/manager/timesheets/${ts.id}`)
                              }
                              size="small"
                              variant="outlined"
                              startIcon={<VisibilityIcon fontSize="small" />}
                              sx={{
                                borderRadius: 1.5,
                                textTransform: "none",
                                fontWeight: 700,
                                fontSize: 12,
                                borderColor: "#3949ab",
                                color: "#3949ab",
                                "&:hover": {
                                  bgcolor: "rgba(57,73,171,0.06)",
                                  borderColor: "#1a237e",
                                },
                              }}
                            >
                              Review
                            </Button>

                            {/* Approve / Reject – only for SUBMITTED */}
                            {ts.status === "SUBMITTED" && (
                              <>
                                <Button
                                  onClick={() => handleApprove(ts.id)}
                                  disabled={approvingId === ts.id}
                                  size="small"
                                  variant="outlined"
                                  color="success"
                                  startIcon={
                                    approvingId === ts.id ? (
                                      <CircularProgress
                                        size={12}
                                        color="inherit"
                                      />
                                    ) : (
                                      <CheckCircleIcon fontSize="small" />
                                    )
                                  }
                                  sx={{
                                    borderRadius: 1.5,
                                    textTransform: "none",
                                    fontWeight: 700,
                                    fontSize: 12,
                                  }}
                                >
                                  Approve
                                </Button>
                                <Button
                                  onClick={() => setRejectTarget(ts)}
                                  size="small"
                                  variant="outlined"
                                  color="error"
                                  startIcon={<CancelIcon fontSize="small" />}
                                  sx={{
                                    borderRadius: 1.5,
                                    textTransform: "none",
                                    fontWeight: 700,
                                    fontSize: 12,
                                  }}
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Card>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => fetchTimesheets(page)}
          />
        </Box>
      </Box>

      {rejectTarget && (
        <RejectModal
          timesheet={rejectTarget}
          onClose={() => setRejectTarget(null)}
          onRejected={() => {
            fetchTimesheets(currentPage);
            setRejectTarget(null);
          }}
        />
      )}
    </Box>
  );
};

export default ManagerTimesheetsPage;
