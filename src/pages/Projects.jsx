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
  TablePagination,
  Paper,
  Chip,
  Avatar,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  Checkbox,
  InputAdornment,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import SearchIcon from "@mui/icons-material/Search";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import {
  createProject,
  getProjects,
  updateProject,
  getUsers,
  assignProject,
} from "../services/api";
import toast from "react-hot-toast";

// ─── Status Chip ──────────────────────────────────────────────────────────────
const StatusChip = ({ status }) => {
  const styles = {
    Active: {
      bg: "rgba(76,175,80,0.12)",
      color: "#2e7d32",
      border: "#81c784",
    },
    "On Hold": {
      bg: "rgba(255,152,0,0.12)",
      color: "#e65100",
      border: "#ffb74d",
    },
    Completed: {
      bg: "rgba(25,118,210,0.12)",
      color: "#1565c0",
      border: "#90caf9",
    },
  };
  const s = styles[status] || styles.Active;
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

// ─── Create Project Dialog ────────────────────────────────────────────────────
const EMPTY_PROJECT_FORM = {
  name: "",
  description: "",
  startDate: "",
  endDate: "",
};

const CreateProjectDialog = ({ open, onClose, onCreate }) => {
  const [form, setForm] = useState(EMPTY_PROJECT_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({ ...EMPTY_PROJECT_FORM });
      setErrors({});
      setSubmitting(false);
    }
  }, [open]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Project name is required";
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
      await onCreate(form);
      onClose();
    } catch {
      // error toast handled by onCreate
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Create Project</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}>
          <TextField
            label="Project Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            error={!!errors.name}
            helperText={errors.name}
            placeholder="Enter project name"
            fullWidth
            size="small"
            required
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Description"
            name="description"
            value={form.description}
            onChange={handleChange}
            error={!!errors.description}
            helperText={errors.description}
            placeholder="Enter project description"
            fullWidth
            size="small"
            required
            multiline
            rows={3}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Start Date"
            name="startDate"
            type="date"
            value={form.startDate}
            onChange={handleChange}
            fullWidth
            size="small"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="End Date"
            name="endDate"
            type="date"
            value={form.endDate}
            onChange={handleChange}
            fullWidth
            size="small"
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
          sx={{ borderRadius: 2, fontWeight: 700, minWidth: 130 }}
        >
          {submitting ? "Creating…" : "Create Project"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── Edit Project Dialog ─────────────────────────────────────────────────────────────
const EditProjectDialog = ({ open, onClose, onSave, project }) => {
  const [form, setForm] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    active: true,
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && project) {
      setForm({
        name: project.name || "",
        description: project.description || "",
        startDate: project.startDate || project.createdAt?.split("T")[0] || "",
        endDate: project.endDate || "",
        active: project.active !== undefined ? project.active : true,
      });
      setErrors({});
      setSubmitting(false);
    }
  }, [open, project]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Project name is required";
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
      // error toast handled by onSave
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Edit Project</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}>
          <TextField
            label="Project Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            error={!!errors.name}
            helperText={errors.name}
            placeholder="Enter project name"
            fullWidth
            size="small"
            required
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Description"
            name="description"
            value={form.description}
            onChange={handleChange}
            error={!!errors.description}
            helperText={errors.description}
            placeholder="Enter project description"
            fullWidth
            size="small"
            required
            multiline
            rows={3}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Start Date"
            name="startDate"
            type="date"
            value={form.startDate}
            onChange={handleChange}
            fullWidth
            size="small"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="End Date"
            name="endDate"
            type="date"
            value={form.endDate}
            onChange={handleChange}
            fullWidth
            size="small"
            InputLabelProps={{ shrink: true }}
          />
          <FormControlLabel
            control={
              <Switch
                name="active"
                checked={form.active}
                onChange={handleChange}
                color="primary"
              />
            }
            label={form.active ? "Active" : "Inactive"}
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
          sx={{ borderRadius: 2, fontWeight: 700, minWidth: 130 }}
        >
          {submitting ? "Saving…" : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── Role Chip (mini) ──────────────────────────────────────────────────────────

const ROLE_STYLE = {
  ROLE_ADMIN: { bg: "rgba(156,39,176,0.10)", color: "#6a1b9a" },
  ROLE_MANAGER: { bg: "rgba(25,118,210,0.10)", color: "#1565c0" },
  ROLE_USER: { bg: "rgba(76,175,80,0.10)", color: "#2e7d32" },
};

const MiniRoleChip = ({ role }) => {
  const s = ROLE_STYLE[role] || ROLE_STYLE.ROLE_USER;
  const label = role?.replace("ROLE_", "") || "USER";
  return (
    <Chip
      label={label}
      size="small"
      sx={{
        fontSize: 10,
        fontWeight: 700,
        height: 18,
        bgcolor: s.bg,
        color: s.color,
      }}
    />
  );
};

// ─── Assign Dialog ────────────────────────────────────────────────────────────
const AssignDialog = ({ open, project, onClose }) => {
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSearch("");
    setSelected([]);
    setLoadingUsers(true);
    getUsers({ page: 0, size: 100 })
      .then((res) => setUsers(res.data?.users || []))
      .catch(() => toast.error("Failed to load users"))
      .finally(() => setLoadingUsers(false));
  }, [open]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter(
      (u) =>
        u.firstName?.toLowerCase().includes(q) ||
        u.lastName?.toLowerCase().includes(q) ||
        u.username?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q),
    );
  }, [users, search]);

  const toggleUser = (id) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const handleConfirm = async () => {
    if (selected.length === 0) {
      toast.error("Please select at least one user to assign.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await assignProject({
        projectId: project.id,
        userIds: selected,
      });
      const { message, skipped } = res.data;
      toast.success(message || `Assigned "${project.name}" successfully`);
      if (skipped?.length > 0) {
        toast(`${skipped.length} user(s) were skipped (already assigned).`, {
          icon: "ℹ️",
        });
      }
      onClose();
    } catch (err) {
      const msg =
        err.response?.data?.message || "Assignment failed. Please try again.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!project) return null;

  const initials = (u) =>
    `${u.firstName?.[0] || ""}${u.lastName?.[0] || ""}`.toUpperCase() ||
    u.username?.[0]?.toUpperCase() ||
    "?";

  const AVATAR_COLORS = ["#1565c0", "#6a1b9a", "#2e7d32", "#e65100", "#4527a0"];
  const avatarColor = (u) => AVATAR_COLORS[(u.id || 0) % AVATAR_COLORS.length];

  return (
    <Dialog
      open={open}
      onClose={!submitting ? onClose : undefined}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, overflow: "hidden" } }}
    >
      {/* Gradient header */}
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
        <PeopleAltIcon sx={{ color: "rgba(255,255,255,0.85)", fontSize: 28 }} />
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" fontWeight={700} color="#fff">
            Assign Project
          </Typography>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>
            {project.name}
          </Typography>
        </Box>
        {selected.length > 0 && (
          <Chip
            icon={
              <CheckCircleIcon
                sx={{ fontSize: "14px !important", color: "#fff !important" }}
              />
            }
            label={`${selected.length} selected`}
            size="small"
            sx={{
              bgcolor: "rgba(255,255,255,0.18)",
              color: "#fff",
              fontWeight: 700,
              border: "1px solid rgba(255,255,255,0.3)",
            }}
          />
        )}
      </Box>

      <DialogContent sx={{ p: 0 }}>
        {/* Search bar */}
        <Box sx={{ px: 2.5, pt: 2, pb: 1.5 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search by name, username or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "text.disabled", fontSize: 18 }} />
                </InputAdornment>
              ),
            }}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />
        </Box>

        <Divider />

        {/* User list */}
        <Box sx={{ maxHeight: 340, overflowY: "auto" }}>
          {loadingUsers ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
              <CircularProgress size={28} />
            </Box>
          ) : filtered.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 6, color: "text.disabled" }}>
              <Typography variant="body2">No users found</Typography>
            </Box>
          ) : (
            <List disablePadding>
              {filtered.map((u, idx) => {
                const isSelected = selected.includes(u.id);
                const role = Array.isArray(u.roles) ? u.roles[0] : u.role;
                return (
                  <ListItem
                    key={u.id}
                    onClick={() => toggleUser(u.id)}
                    sx={{
                      px: 2.5,
                      py: 1.25,
                      borderBottom:
                        idx < filtered.length - 1
                          ? "1px solid rgba(0,0,0,0.05)"
                          : "none",
                      bgcolor: isSelected
                        ? "rgba(25,118,210,0.06)"
                        : "transparent",
                      transition: "background 0.15s",
                      "&:hover": {
                        bgcolor: isSelected
                          ? "rgba(25,118,210,0.10)"
                          : "#f8fafc",
                        cursor: "pointer",
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        src={
                          u.photoUrl
                            ? `http://localhost:8080/${u.photoUrl}`
                            : undefined
                        }
                        sx={{
                          width: 42,
                          height: 42,
                          bgcolor: avatarColor(u),
                          fontSize: 15,
                          fontWeight: 700,
                        }}
                      >
                        {!u.photoUrl && initials(u)}
                      </Avatar>
                    </ListItemAvatar>

                    <ListItemText
                      primary={
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Typography variant="body2" fontWeight={600}>
                            {u.firstName} {u.lastName}
                          </Typography>
                          {role && <MiniRoleChip role={role} />}
                        </Box>
                      }
                      secondary={
                        <Box
                          component="span"
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 0.25,
                          }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            @{u.username}&nbsp;&bull;&nbsp;{u.email}
                          </Typography>
                          {u.managerEmail && (
                            <Typography variant="caption" color="text.disabled">
                              Manager: {u.managerEmail}
                            </Typography>
                          )}
                        </Box>
                      }
                    />

                    <ListItemSecondaryAction>
                      <Checkbox
                        edge="end"
                        checked={isSelected}
                        onChange={() => toggleUser(u.id)}
                        sx={{
                          color: "#1976d2",
                          "&.Mui-checked": { color: "#1976d2" },
                        }}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                );
              })}
            </List>
          )}
        </Box>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button
          onClick={onClose}
          disabled={submitting}
          sx={{ borderRadius: 2, fontWeight: 600 }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={submitting || selected.length === 0}
          startIcon={
            submitting ? (
              <CircularProgress size={14} color="inherit" />
            ) : (
              <AssignmentIndIcon fontSize="small" />
            )
          }
          sx={{
            borderRadius: 2,
            fontWeight: 700,
            minWidth: 150,
            background: "linear-gradient(90deg,#1976d2,#42a5f5)",
            "&:hover": { background: "linear-gradient(90deg,#1565c0,#2196f3)" },
            "&.Mui-disabled": { background: "rgba(0,0,0,0.12)" },
          }}
        >
          {submitting
            ? "Assigning…"
            : `Assign${selected.length > 0 ? ` (${selected.length})` : ""}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const Projects = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [assignTarget, setAssignTarget] = useState(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const SIDEBAR_WIDTH = sidebarOpen ? 240 : 72;

  const fetchProjects = async (pg = page, rpp = rowsPerPage) => {
    setLoading(true);
    try {
      const res = await getProjects({
        activeOnly: true,
        page: pg,
        size: rpp,
        sortBy: "name",
        sortDir: "asc",
      });
      const data = res.data;
      setProjects(data.projects || []);
      setTotalItems(data.totalItems || 0);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to load projects.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects(page, rowsPerPage);
  }, [page, rowsPerPage]);

  const handleCreate = async (form) => {
    const response = await createProject({
      name: form.name,
      description: form.description,
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
    }).catch((err) => {
      const msg =
        err.response?.data?.message ||
        "Failed to create project. Please try again.";
      toast.error(msg);
      throw err;
    });
    const created = response.data;
    toast.success(`Project "${created.name}" created successfully`);
    await fetchProjects(page, rowsPerPage); // re-fetch to stay in sync
  };

  const handleUpdate = async (form) => {
    await updateProject(editTarget.id, form).catch((err) => {
      const msg = err.response?.data?.message || "Failed to update project.";
      toast.error(msg);
      throw err;
    });
    toast.success(`Project "${form.name}" updated successfully`);
    await fetchProjects(page, rowsPerPage);
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f0f4f8" }}>
      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isMobile={isMobile}
      />

      {/* Main content */}
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
        <Navbar
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          sidebarOpen={sidebarOpen}
        />

        <Box
          sx={{
            pt: { xs: 8, sm: 9 },
            px: { xs: 2, sm: 3 },
            pb: 4,
            flexGrow: 1,
          }}
        >
          {/* Page header banner */}
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
              justifyContent: "space-between",
              flexWrap: "wrap",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <FolderIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  Projects
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.75, mt: 0.25 }}>
                  View and assign projects to team members.
                </Typography>
              </Box>
            </Box>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateDialogOpen(true)}
              sx={{
                bgcolor: "rgba(255,255,255,0.15)",
                color: "#fff",
                fontWeight: 700,
                borderRadius: 2,
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.3)",
                "&:hover": { bgcolor: "rgba(255,255,255,0.25)" },
              }}
            >
              Create Project
            </Button>
          </Box>

          {/* Projects table */}
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
              border: "1px solid rgba(0,0,0,0.06)",
            }}
          >
            <CardContent sx={{ p: 0 }}>
              {/* Table toolbar */}
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
                  All Projects
                </Typography>
                {!loading && (
                  <Chip
                    label={`${projects.length} project${projects.length !== 1 ? "s" : ""}`}
                    size="small"
                    sx={{
                      bgcolor: "#e3f2fd",
                      color: "#1565c0",
                      fontWeight: 700,
                    }}
                  />
                )}
              </Box>

              <TableContainer
                component={Paper}
                elevation={0}
                sx={{ borderRadius: 0 }}
              >
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#f8fafc" }}>
                      <TableCell sx={{ fontWeight: 700, color: "#475569" }}>
                        Project
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#475569" }}>
                        Description
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#475569" }}>
                        Start Date
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#475569" }}>
                        End Date
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#475569" }}>
                        Status
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: 700, color: "#475569" }}
                        align="center"
                      >
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {loading && (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                          <CircularProgress size={32} />
                        </TableCell>
                      </TableRow>
                    )}

                    {!loading &&
                      projects.map((p) => (
                        <TableRow
                          key={p.id}
                          sx={{
                            "&:hover": { bgcolor: "#f8fafc" },
                            transition: "background 0.15s",
                          }}
                        >
                          <TableCell>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                              }}
                            >
                              <Avatar
                                sx={{
                                  width: 34,
                                  height: 34,
                                  bgcolor: "#1565c0",
                                  fontSize: 13,
                                  fontWeight: 700,
                                }}
                              >
                                {p.name[0].toUpperCase()}
                              </Avatar>
                              <Typography variant="body2" fontWeight={600}>
                                {p.name}
                              </Typography>
                            </Box>
                          </TableCell>

                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {p.description}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {p.startDate || p.createdAt?.split("T")[0] || "—"}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {p.endDate || "—"}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <StatusChip
                              status={
                                p.active !== undefined
                                  ? p.active
                                    ? "Active"
                                    : "Inactive"
                                  : p.status || "Active"
                              }
                            />
                          </TableCell>

                          <TableCell align="center">
                            <Box
                              sx={{
                                display: "flex",
                                gap: 1.5,
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                            >
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<EditIcon fontSize="small" />}
                                onClick={() => setEditTarget(p)}
                                sx={{
                                  borderRadius: 2,
                                  fontWeight: 700,
                                  fontSize: 12,
                                  textTransform: "none",
                                  borderColor: "#1976d2",
                                  color: "#1976d2",
                                  "&:hover": {
                                    bgcolor: "rgba(25,118,210,0.06)",
                                  },
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                size="small"
                                variant="contained"
                                startIcon={
                                  <AssignmentIndIcon fontSize="small" />
                                }
                                onClick={() => setAssignTarget(p)}
                                sx={{
                                  borderRadius: 2,
                                  fontWeight: 700,
                                  fontSize: 12,
                                  textTransform: "none",
                                  background:
                                    "linear-gradient(90deg,#1976d2,#42a5f5)",
                                  boxShadow: "0 2px 8px rgba(25,118,210,0.3)",
                                  "&:hover": {
                                    background:
                                      "linear-gradient(90deg,#1565c0,#2196f3)",
                                  },
                                }}
                              >
                                Assign
                              </Button>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}

                    {!loading && projects.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          align="center"
                          sx={{ py: 8, color: "text.secondary" }}
                        >
                          <Typography variant="body1" fontWeight={500}>
                            No project found
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ mt: 0.5, color: "text.disabled" }}
                          >
                            Click &quot;Create Project&quot; to add the first
                            project.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                component="div"
                count={totalItems}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={(_, newPage) => setPage(newPage)}
                rowsPerPageOptions={[5, 10, 25]}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                sx={{ borderTop: "1px solid rgba(0,0,0,0.06)", px: 2 }}
              />
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Edit Project dialog */}
      <EditProjectDialog
        open={Boolean(editTarget)}
        project={editTarget}
        onClose={() => setEditTarget(null)}
        onSave={handleUpdate}
      />

      {/* Create Project dialog */}
      <CreateProjectDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onCreate={handleCreate}
      />

      {/* Assign dialog */}
      <AssignDialog
        open={Boolean(assignTarget)}
        project={assignTarget}
        onClose={() => setAssignTarget(null)}
      />
    </Box>
  );
};

export default Projects;
