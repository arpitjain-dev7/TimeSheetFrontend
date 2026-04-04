import { useState, useEffect, useMemo } from "react";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
  InputAdornment,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AddIcon from "@mui/icons-material/Add";
import FilterListIcon from "@mui/icons-material/FilterList";
import FolderSpecialIcon from "@mui/icons-material/FolderSpecial";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import {
  getMyProjects,
  getTimesheets,
  createTimesheet,
  updateTimesheet,
} from "../services/api";
import toast from "react-hot-toast";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Convert decimal hours (e.g. 9.5) to "09h 30m" */
const formatHours = (h) => {
  if (h == null) return "—";
  const totalMins = Math.round(Number(h) * 60);
  const hrs = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  return `${String(hrs).padStart(2, "0")}h ${String(mins).padStart(2, "0")}m`;
};

/** Format ISO date string to dd/MM/yyyy */
const formatDate = (d) => {
  if (!d) return "—";
  const dt = new Date(d);
  if (isNaN(dt)) return d;
  return dt.toLocaleDateString("en-GB"); // dd/MM/yyyy
};

const STATUS_OPTIONS = ["Pending", "Approved", "Rejected"];

// ─── Status Chip ──────────────────────────────────────────────────────────────
const StatusChip = ({ status }) => {
  const map = {
    Approved: {
      bg: "rgba(76,175,80,0.12)",
      color: "#2e7d32",
      border: "#81c784",
    },
    Pending: {
      bg: "rgba(255,152,0,0.12)",
      color: "#e65100",
      border: "#ffb74d",
    },
    Rejected: {
      bg: "rgba(211,47,47,0.10)",
      color: "#c62828",
      border: "#ef9a9a",
    },
  };
  const s = map[status] || map.Pending;
  return (
    <Chip
      label={status}
      size="small"
      sx={{
        fontWeight: 700,
        fontSize: 11,
        bgcolor: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
      }}
    />
  );
};

// ─── Add / Edit Timesheet Dialog ──────────────────────────────────────────────
const EMPTY_TS_FORM = {
  projectId: "",
  logDate: "",
  hours: "",
  description: "",
};

const TimesheetDialog = ({ open, onClose, onSave, initial, projects }) => {
  const [form, setForm] = useState(EMPTY_TS_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(
        initial
          ? {
              projectId: initial.projectId || initial.project?.id || "",
              logDate: initial.logDate || initial.date || "",
              hours: initial.hours ?? "",
              description: initial.description || "",
            }
          : { ...EMPTY_TS_FORM },
      );
      setErrors({});
      setSubmitting(false);
    }
  }, [open, initial]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.projectId) errs.projectId = "Project is required";
    if (!form.logDate) errs.logDate = "Date is required";
    if (!form.hours || isNaN(Number(form.hours)) || Number(form.hours) <= 0)
      errs.hours = "Enter valid hours (e.g. 8 or 7.5)";
    if (Number(form.hours) > 24) errs.hours = "Cannot exceed 24 hours";
    if (!form.description.trim()) errs.description = "Description is required";
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    try {
      await onSave(form);
      onClose();
    } catch {
      // error handled by onSave
    } finally {
      setSubmitting(false);
    }
  };

  const isEdit = Boolean(initial?.id);

  return (
    <Dialog
      open={open}
      onClose={!submitting ? onClose : undefined}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      {/* Header */}
      <Box
        sx={{
          background:
            "linear-gradient(135deg,#1a237e 0%,#283593 60%,#01579b 100%)",
          px: 3,
          py: 2.5,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <AccessTimeIcon
          sx={{ color: "rgba(255,255,255,0.85)", fontSize: 26 }}
        />
        <Typography variant="h6" fontWeight={700} color="#fff">
          {isEdit ? "Edit Timesheet" : "Add Timesheet"}
        </Typography>
      </Box>

      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          {/* Project Select */}
          <FormControl fullWidth size="small" error={!!errors.projectId}>
            <InputLabel shrink>Project *</InputLabel>
            <Select
              name="projectId"
              value={form.projectId}
              onChange={handleChange}
              displayEmpty
              notched
              label="Project *"
            >
              <MenuItem value="" disabled>
                <Typography color="text.disabled">Select project</Typography>
              </MenuItem>
              {projects.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name}
                </MenuItem>
              ))}
            </Select>
            {errors.projectId && (
              <Typography
                variant="caption"
                color="error"
                sx={{ mt: 0.5, ml: 1.5 }}
              >
                {errors.projectId}
              </Typography>
            )}
          </FormControl>

          {/* Log Date */}
          <TextField
            label="Log Date *"
            name="logDate"
            type="date"
            value={form.logDate}
            onChange={handleChange}
            error={!!errors.logDate}
            helperText={errors.logDate}
            fullWidth
            size="small"
            InputLabelProps={{ shrink: true }}
          />

          {/* Hours */}
          <TextField
            label="Hours Worked *"
            name="hours"
            type="number"
            value={form.hours}
            onChange={handleChange}
            error={!!errors.hours}
            helperText={errors.hours || "Enter decimal hours, e.g. 8 or 7.5"}
            placeholder="e.g. 8"
            fullWidth
            size="small"
            inputProps={{ min: 0.5, max: 24, step: 0.5 }}
            InputLabelProps={{ shrink: true }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Typography variant="caption" color="text.disabled">
                    hrs
                  </Typography>
                </InputAdornment>
              ),
            }}
          />

          {/* Description */}
          <TextField
            label="Description *"
            name="description"
            value={form.description}
            onChange={handleChange}
            error={!!errors.description}
            helperText={errors.description}
            placeholder="Describe your work for the day…"
            fullWidth
            size="small"
            multiline
            rows={3}
            InputLabelProps={{ shrink: true }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button
          onClick={onClose}
          disabled={submitting}
          sx={{ borderRadius: 2 }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={submitting}
          startIcon={
            submitting ? <CircularProgress size={14} color="inherit" /> : null
          }
          sx={{
            borderRadius: 2,
            fontWeight: 700,
            minWidth: 130,
            background: "linear-gradient(90deg,#1976d2,#42a5f5)",
            "&:hover": { background: "linear-gradient(90deg,#1565c0,#2196f3)" },
          }}
        >
          {submitting
            ? isEdit
              ? "Saving…"
              : "Adding…"
            : isEdit
              ? "Save Changes"
              : "Add Timesheet"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── View Timesheet Dialog ────────────────────────────────────────────────────
const ViewDialog = ({ open, onClose, ts }) => {
  if (!ts) return null;
  const rows = [
    { label: "Project", value: ts.projectName || ts.project?.name || "—" },
    { label: "Log Date", value: formatDate(ts.logDate || ts.date) },
    { label: "Hours", value: formatHours(ts.hours) },
    { label: "Status", value: <StatusChip status={ts.status || "Pending"} /> },
    { label: "Description", value: ts.description || "—" },
  ];
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
        Timesheet Details
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {rows.map(({ label, value }) => (
            <Box
              key={label}
              sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}
            >
              <Typography
                variant="caption"
                color="text.disabled"
                fontWeight={600}
                sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}
              >
                {label}
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {value}
              </Typography>
            </Box>
          ))}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2 }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const UserDashboard = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const SIDEBAR_WIDTH = sidebarOpen ? 240 : 72;

  // Data
  const [myProjects, setMyProjects] = useState([]);
  const [timesheets, setTimesheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projectsLoading, setProjectsLoading] = useState(true);

  // Filters
  const [filterProject, setFilterProject] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");

  // Dialogs
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);
  const [preselectedProject, setPreselectedProject] = useState(null);

  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  // Fetch assigned projects
  const fetchMyProjects = async () => {
    setProjectsLoading(true);
    try {
      const res = await getMyProjects();
      // API returns a plain array
      const data = res.data;
      setMyProjects(Array.isArray(data) ? data : data?.projects || []);
    } catch {
      toast.error("Failed to load assigned projects.");
    } finally {
      setProjectsLoading(false);
    }
  };

  // Fetch timesheets
  const fetchTimesheets = async () => {
    setLoading(true);
    try {
      const res = await getTimesheets();
      setTimesheets(res.data?.timesheets || res.data || []);
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

  // Client-side filter
  const filtered = useMemo(() => {
    return timesheets.filter((t) => {
      const tProject = String(t.projectId || t.project?.id || "");
      const tStatus = t.status || "Pending";
      const tDate = t.logDate || t.date || "";
      if (filterProject && tProject !== String(filterProject)) return false;
      if (filterStatus && tStatus !== filterStatus) return false;
      if (filterFrom && tDate < filterFrom) return false;
      if (filterTo && tDate > filterTo) return false;
      return true;
    });
  }, [timesheets, filterProject, filterStatus, filterFrom, filterTo]);

  const handleSubmitFilter = () => {
    // Filters are applied reactively via useMemo; this triggers re-render visually
    toast.success("Filter applied");
  };

  const handleResetFilter = () => {
    setFilterProject("");
    setFilterStatus("");
    setFilterFrom("");
    setFilterTo("");
  };

  // Open add dialog, optionally pre-selecting a project
  const openAddDialog = (project = null) => {
    setPreselectedProject(project);
    setEditTarget(null);
    setAddDialogOpen(true);
  };

  const handleSave = async (form) => {
    const payload = {
      projectId: Number(form.projectId),
      logDate: form.logDate,
      hours: Number(form.hours),
      description: form.description,
    };

    if (editTarget?.id) {
      await updateTimesheet(editTarget.id, payload).catch((err) => {
        const msg =
          err.response?.data?.message || "Failed to update timesheet.";
        toast.error(msg);
        throw err;
      });
      toast.success("Timesheet updated successfully");
    } else {
      await createTimesheet(payload).catch((err) => {
        const msg = err.response?.data?.message || "Failed to add timesheet.";
        toast.error(msg);
        throw err;
      });
      toast.success("Timesheet added successfully");
    }
    await fetchTimesheets();
  };

  const dialogInitial = useMemo(() => {
    if (editTarget) return editTarget;
    if (preselectedProject) return { projectId: preselectedProject.id };
    return null;
  }, [editTarget, preselectedProject]);

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
                  onClick={() => openAddDialog()}
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
                      onClick={() => openAddDialog(p)}
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
                  alignItems: "flex-end",
                }}
              >
                {/* Project Name filter */}
                <FormControl size="small" sx={{ minWidth: 170 }}>
                  <InputLabel shrink>Project Name</InputLabel>
                  <Select
                    value={filterProject}
                    onChange={(e) => setFilterProject(e.target.value)}
                    displayEmpty
                    notched
                    label="Project Name"
                  >
                    <MenuItem value="">All Projects</MenuItem>
                    {myProjects.map((p) => (
                      <MenuItem key={p.id} value={p.id}>
                        {p.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Status filter */}
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel shrink>Status</InputLabel>
                  <Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
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

                {/* From date */}
                <TextField
                  label="From"
                  type="date"
                  size="small"
                  value={filterFrom}
                  onChange={(e) => setFilterFrom(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ minWidth: 150 }}
                />

                {/* To date */}
                <TextField
                  label="To"
                  type="date"
                  size="small"
                  value={filterTo}
                  onChange={(e) => setFilterTo(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ minWidth: 150 }}
                />

                {/* Submit */}
                <Button
                  variant="contained"
                  startIcon={<FilterListIcon />}
                  onClick={handleSubmitFilter}
                  sx={{
                    borderRadius: 2,
                    fontWeight: 700,
                    px: 3,
                    background: "linear-gradient(90deg,#1a237e,#1976d2)",
                    "&:hover": {
                      background: "linear-gradient(90deg,#0d1b6e,#1565c0)",
                    },
                  }}
                >
                  Submit
                </Button>

                {(filterProject || filterStatus || filterFrom || filterTo) && (
                  <Button
                    variant="text"
                    size="small"
                    onClick={handleResetFilter}
                    sx={{ borderRadius: 2, color: "text.secondary" }}
                  >
                    Reset
                  </Button>
                )}
              </Box>

              {/* ── Table ── */}
              <TableContainer
                component={Paper}
                elevation={0}
                sx={{ borderRadius: 0 }}
              >
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#eef3fb" }}>
                      {[
                        "No",
                        "Project Name",
                        "Hours",
                        "Log Date",
                        "Description",
                        "Status",
                        "Action",
                      ].map((h) => (
                        <TableCell
                          key={h}
                          align={h === "Action" ? "center" : "left"}
                          sx={{
                            fontWeight: 700,
                            color: "#475569",
                            fontSize: 13,
                            py: 1.5,
                          }}
                        >
                          {h}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {loading && (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                          <CircularProgress size={28} />
                        </TableCell>
                      </TableRow>
                    )}

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
                            Click a project above or &quot;Add Timesheet&quot;
                            to log your work.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}

                    {!loading &&
                      filtered.map((t, idx) => {
                        const projectName =
                          t.projectName || t.project?.name || "—";
                        const status = t.status || "Pending";
                        const isPending = status === "Pending";
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
                                color: "text.secondary",
                                fontWeight: 600,
                                width: 50,
                              }}
                            >
                              {idx + 1}
                            </TableCell>

                            <TableCell>
                              <Typography
                                variant="body2"
                                fontWeight={600}
                                color="#1565c0"
                                sx={{ cursor: "default" }}
                              >
                                {projectName}
                              </Typography>
                            </TableCell>

                            <TableCell>
                              <Typography variant="body2" fontWeight={600}>
                                {formatHours(t.hours)}
                              </Typography>
                            </TableCell>

                            <TableCell>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {formatDate(t.logDate || t.date)}
                              </Typography>
                            </TableCell>

                            <TableCell sx={{ maxWidth: 180 }}>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  maxWidth: 160,
                                }}
                                title={t.description}
                              >
                                {t.description || "—"}
                              </Typography>
                            </TableCell>

                            <TableCell>
                              <StatusChip status={status} />
                            </TableCell>

                            <TableCell align="center">
                              <Box
                                sx={{
                                  display: "flex",
                                  gap: 0.5,
                                  justifyContent: "center",
                                }}
                              >
                                <Tooltip
                                  title={
                                    isPending
                                      ? "Edit"
                                      : "Cannot edit approved/rejected timesheet"
                                  }
                                >
                                  <span>
                                    <IconButton
                                      size="small"
                                      disabled={!isPending}
                                      onClick={() => {
                                        setPreselectedProject(null);
                                        setEditTarget(t);
                                        setAddDialogOpen(true);
                                      }}
                                      sx={{
                                        color: isPending
                                          ? "#1976d2"
                                          : "text.disabled",
                                        "&:hover": {
                                          bgcolor: "rgba(25,118,210,0.08)",
                                        },
                                      }}
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                  </span>
                                </Tooltip>

                                <Tooltip title="View details">
                                  <IconButton
                                    size="small"
                                    onClick={() => setViewTarget(t)}
                                    sx={{
                                      color: "#0288d1",
                                      "&:hover": {
                                        bgcolor: "rgba(2,136,209,0.08)",
                                      },
                                    }}
                                  >
                                    <VisibilityIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
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

      {/* Add / Edit Dialog */}
      <TimesheetDialog
        open={addDialogOpen}
        onClose={() => {
          setAddDialogOpen(false);
          setEditTarget(null);
          setPreselectedProject(null);
        }}
        onSave={handleSave}
        initial={dialogInitial}
        projects={myProjects}
      />

      {/* View Dialog */}
      <ViewDialog
        open={Boolean(viewTarget)}
        ts={viewTarget}
        onClose={() => setViewTarget(null)}
      />
    </Box>
  );
};

export default UserDashboard;
