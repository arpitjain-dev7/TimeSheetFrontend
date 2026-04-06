import { useState, useEffect } from "react";
import EditUserForm from "../components/EditUserForm";
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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
  Avatar,
  Tooltip,
  Grid,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PeopleIcon from "@mui/icons-material/People";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import {
  registerUser,
  createUser,
  getUsers,
  updateUser,
  updateUserAdmin,
  deleteUser,
  getProjects,
  getProjectAssignedUsers,
  getManagers,
  updateUserPhoto,
} from "../services/api";
import toast from "react-hot-toast";

// ─── Constants ────────────────────────────────────────────────────────────────

const ROLES = ["ROLE_ADMIN", "ROLE_MANAGER", "ROLE_USER"];
const STATUSES = ["Active", "Inactive"];
const GENDERS = [
  { label: "Male", value: "MALE" },
  { label: "Female", value: "FEMALE" },
  { label: "Other", value: "OTHER" },
  { label: "Prefer not to say", value: "PREFER_NOT_TO_SAY" },
];
const EMPLOYMENT_TYPES = [
  { label: "Full-Time", value: "FULL_TIME" },
  { label: "Part-Time", value: "PART_TIME" },
  { label: "Contract", value: "CONTRACT" },
  { label: "Intern", value: "INTERN" },
];

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  username: "",
  email: "",
  password: "",
  gender: "",
  location: "",
  designation: "",
  managerEmail: "", // used in edit mode (updateUser API)
  managerId: null, // used in create mode (createUser API)
  typeOfEmployment: "",
  role: "ROLE_USER",
};

// ─── Role Chip ────────────────────────────────────────────────────────────────

const RoleChip = ({ role }) => {
  const styleMap = {
    ROLE_ADMIN: {
      bg: "rgba(156,39,176,0.12)",
      color: "#6a1b9a",
      border: "#ce93d8",
    },
    ROLE_MANAGER: {
      bg: "rgba(25,118,210,0.12)",
      color: "#1565c0",
      border: "#90caf9",
    },
    ROLE_USER: {
      bg: "rgba(76,175,80,0.12)",
      color: "#2e7d32",
      border: "#81c784",
    },
  };
  const s = styleMap[role] || styleMap.ROLE_USER;
  return (
    <Chip
      label={role}
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

// ─── Status Chip ──────────────────────────────────────────────────────────────

const StatusChip = ({ status }) => (
  <Chip
    label={status}
    size="small"
    sx={{
      fontWeight: 700,
      fontSize: 11,
      bgcolor:
        status === "Active" ? "rgba(76,175,80,0.12)" : "rgba(244,67,54,0.10)",
      color: status === "Active" ? "#2e7d32" : "#c62828",
      border: `1px solid ${status === "Active" ? "#81c784" : "#ef9a9a"}`,
    }}
  />
);

// ─── Create / Edit User Dialog ────────────────────────────────────────────────

const UserDialog = ({ open, onClose, onSave, initial }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Manager dropdown state (create mode only)
  const [managers, setManagers] = useState([]);
  const [managersLoading, setManagersLoading] = useState(false);
  const [managersError, setManagersError] = useState(null);

  // Sync form state whenever the dialog opens or the target user changes
  useEffect(() => {
    if (open) {
      setForm(initial ? { ...initial } : { ...EMPTY_FORM });
      setPhoto(null);
      setPhotoPreview(null);
      setErrors({});
      setSubmitting(false);
    }
    if (!open) {
      setManagers([]);
      setManagersError(null);
    }
  }, [open, initial]);

  // Fetch managers list when dialog opens (both create and edit mode)
  useEffect(() => {
    if (open) {
      setManagersLoading(true);
      setManagersError(null);
      getManagers()
        .then((res) => setManagers(res.data || []))
        .catch(() =>
          setManagersError("Failed to load managers. Please refresh."),
        )
        .finally(() => setManagersLoading(false));
    }
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      // When role changes away from ROLE_USER, clear managerId (not applicable)
      if (name === "role" && value !== "ROLE_USER") {
        updated.managerId = null;
      }
      return updated;
    });
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const validate = () => {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = "First name is required";
    if (!form.lastName.trim()) errs.lastName = "Last name is required";
    if (!form.username.trim()) errs.username = "Username is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Enter a valid email address";
    if (!initial?.id && !form.password) errs.password = "Password is required";
    else if (!initial?.id && form.password.length < 6)
      errs.password = "Minimum 6 characters";
    // Manager required for ROLE_USER (both create and edit mode)
    if ((form.role === "ROLE_USER" || !form.role) && !form.managerId)
      errs.managerId = "Please select a manager for this user";
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
      await onSave(form, photo);
      onClose();
    } catch (err) {
      // Map 400 field-level validation errors from backend details object
      const details = err?.response?.data?.details;
      if (details && typeof details === "object") {
        setErrors((prev) => ({ ...prev, ...details }));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const isEdit = Boolean(initial?.id);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
        {isEdit ? "Edit User" : "Create User"}
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2.5} sx={{ pt: 1 }}>
          {/* First Name | Last Name */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="First Name"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              error={!!errors.firstName}
              helperText={errors.firstName}
              placeholder="Enter first name"
              fullWidth
              size="small"
              required
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Last Name"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              error={!!errors.lastName}
              helperText={errors.lastName}
              placeholder="Enter last name"
              fullWidth
              size="small"
              required
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* Username */}
          <Grid item xs={12}>
            <TextField
              label="Username"
              name="username"
              value={form.username}
              onChange={handleChange}
              error={!!errors.username}
              helperText={errors.username}
              placeholder="Enter username"
              fullWidth
              size="small"
              required
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* Email */}
          <Grid item xs={12}>
            <TextField
              label="Email"
              name="email"
              value={form.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              placeholder="Enter email address"
              fullWidth
              size="small"
              required
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* Password (create only) */}
          {!isEdit && (
            <Grid item xs={12}>
              <TextField
                label="Password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password}
                placeholder="Enter password"
                fullWidth
                size="small"
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          )}

          {/* Gender */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel shrink>Gender</InputLabel>
              <Select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                displayEmpty
                notched
                label="Gender"
              >
                <MenuItem value="" disabled>
                  <Typography color="text.disabled">Select gender</Typography>
                </MenuItem>
                {GENDERS.map((g) => (
                  <MenuItem key={g.value} value={g.value}>
                    {g.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Location */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Location"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="Enter location"
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* Designation | Manager Email (edit) / Manager dropdown (create) */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Designation"
              name="designation"
              value={form.designation}
              onChange={handleChange}
              placeholder="Enter designation"
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* Manager dropdown — visible for ROLE_USER in both create and edit mode */}
          {(form.role === "ROLE_USER" || !form.role) && (
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small" error={!!errors.managerId}>
                <InputLabel shrink required>
                  Manager
                </InputLabel>
                <Select
                  name="managerId"
                  value={managersLoading ? "" : (form.managerId ?? "")}
                  onChange={(e) => {
                    const val = e.target.value;
                    setForm((prev) => ({
                      ...prev,
                      managerId: val !== "" ? Number(val) : null,
                    }));
                    setErrors((prev) => ({ ...prev, managerId: "" }));
                  }}
                  displayEmpty
                  notched
                  label="Manager"
                  disabled={managersLoading}
                >
                  <MenuItem value="" disabled>
                    {managersLoading
                      ? "Loading managers…"
                      : "— Select a Manager —"}
                  </MenuItem>
                  {!managersLoading && managers.length === 0 && (
                    <MenuItem value="" disabled>
                      No managers available
                    </MenuItem>
                  )}
                  {managers.map((m) => (
                    <MenuItem key={m.id} value={m.id}>
                      {m.firstName} {m.lastName} — {m.email}
                    </MenuItem>
                  ))}
                </Select>
                {(errors.managerId || managersError) && (
                  <FormHelperText>
                    {errors.managerId || managersError}
                  </FormHelperText>
                )}
              </FormControl>
            </Grid>
          )}

          {/* Type of Employment | Role */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel shrink>Type of Employment</InputLabel>
              <Select
                name="typeOfEmployment"
                value={form.typeOfEmployment}
                onChange={handleChange}
                displayEmpty
                notched
                label="Type of Employment"
              >
                <MenuItem value="" disabled>
                  <Typography color="text.disabled">
                    Select employment type
                  </Typography>
                </MenuItem>
                {EMPLOYMENT_TYPES.map((t) => (
                  <MenuItem key={t.value} value={t.value}>
                    {t.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={12}>
            <FormControl fullWidth size="small">
              <InputLabel shrink id="role-label">
                Role
              </InputLabel>
              <Select
                labelId="role-label"
                name="role"
                value={form.role}
                onChange={handleChange}
                displayEmpty
                notched
                label="Role"
                renderValue={(val) =>
                  val || (
                    <Typography color="text.disabled">Select role</Typography>
                  )
                }
              >
                {ROLES.map((r) => (
                  <MenuItem key={r} value={r}>
                    {r}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Profile Photo – edit mode only */}
          {isEdit && (
            <Grid item xs={12}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar
                  src={
                    photoPreview ||
                    (initial?.photoUrl
                      ? `http://localhost:8080/${initial.photoUrl}`
                      : undefined)
                  }
                  sx={{
                    width: 56,
                    height: 56,
                    bgcolor: "#1565c0",
                    fontSize: 20,
                    fontWeight: 700,
                  }}
                >
                  {!photoPreview &&
                    !initial?.photoUrl &&
                    (form.firstName?.[0] || "U").toUpperCase()}
                </Avatar>
                <Box>
                  <Button
                    variant="outlined"
                    component="label"
                    size="small"
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 600,
                    }}
                  >
                    {photo ? "Change Photo" : "Upload Profile Photo"}
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handlePhotoChange}
                    />
                  </Button>
                  {photo && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", mt: 0.5 }}
                    >
                      {photo.name}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Grid>
          )}
        </Grid>
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
          sx={{ borderRadius: 2, fontWeight: 700, minWidth: 120 }}
        >
          {submitting
            ? isEdit
              ? "Saving…"
              : "Creating…"
            : isEdit
              ? "Save Changes"
              : "Create User"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── Delete Confirm Dialog ───────────────────────────────────────────────────

const DeleteConfirmDialog = ({ open, user, onClose, onConfirm }) => {
  const [deleting, setDeleting] = useState(false);

  const handleConfirm = async () => {
    setDeleting(true);
    try {
      await onConfirm();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={!deleting ? onClose : undefined}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, overflow: "visible" } }}
    >
      {/* Warning icon badge */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          mt: -4,
          mb: 1,
        }}
      >
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            bgcolor: "#fff3e0",
            border: "4px solid #fff",
            boxShadow: "0 4px 20px rgba(239,108,0,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <WarningAmberRoundedIcon sx={{ fontSize: 32, color: "#ef6c00" }} />
        </Box>
      </Box>

      <DialogTitle
        sx={{ textAlign: "center", fontWeight: 700, pb: 0.5, pt: 1 }}
      >
        Delete User
      </DialogTitle>

      <DialogContent sx={{ textAlign: "center", pb: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Are you sure you want to delete
        </Typography>
        <Typography variant="body1" fontWeight={700} sx={{ mt: 0.5 }}>
          {user?.firstName} {user?.lastName}
          {user?.username ? (
            <Typography
              component="span"
              variant="body2"
              color="text.secondary"
              fontWeight={400}
            >
              {" "}
              (@{user.username})
            </Typography>
          ) : null}
        </Typography>
        <Typography
          variant="caption"
          color="error.main"
          sx={{
            display: "inline-block",
            mt: 1.5,
            px: 1.5,
            py: 0.5,
            bgcolor: "rgba(211,47,47,0.07)",
            borderRadius: 1,
          }}
        >
          This action cannot be undone.
        </Typography>
      </DialogContent>

      <DialogActions
        sx={{ px: 3, pb: 3, pt: 1, gap: 1, justifyContent: "center" }}
      >
        <Button
          onClick={onClose}
          disabled={deleting}
          variant="outlined"
          sx={{ borderRadius: 2, fontWeight: 600, minWidth: 110 }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={deleting}
          variant="contained"
          color="error"
          startIcon={
            deleting ? (
              <CircularProgress size={14} color="inherit" />
            ) : (
              <DeleteIcon fontSize="small" />
            )
          }
          sx={{ borderRadius: 2, fontWeight: 700, minWidth: 110 }}
        >
          {deleting ? "Deleting…" : "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const UserManagement = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userProjectsMap, setUserProjectsMap] = useState({});
  const [dialogOpen, setDialogOpen] = useState(false); // create dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false); // edit dialog
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const SIDEBAR_WIDTH = sidebarOpen ? 240 : 72;

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      // 1. Fetch all users
      const usersRes = await getUsers({ page: 0, size: 100 });
      const loadedUsers = usersRes.data?.users || [];
      setUsers(loadedUsers);

      // 2. Fetch all projects (no size limit)
      const projRes = await getProjects({
        activeOnly: false,
        page: 0,
        size: 200,
      });
      const allProjects = projRes.data?.projects || [];

      // 3. For each project fetch its assigned users in parallel
      const assignResults = await Promise.allSettled(
        allProjects.map((p) => getProjectAssignedUsers(p.id)),
      );

      // 4. Build inverse map: { userId -> [project, ...] }
      const map = {};
      loadedUsers.forEach((u) => {
        map[u.id] = [];
      });
      assignResults.forEach((result, idx) => {
        if (result.status !== "fulfilled") return;
        const project = allProjects[idx];
        const users = result.value.data?.users || [];
        users.forEach((u) => {
          if (map[u.id] !== undefined) {
            map[u.id].push(project);
          }
        });
      });
      setUserProjectsMap(map);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to load users.";
      toast.error(msg);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = () => {
    setEditTarget(null);
    setDialogOpen(true);
  };

  const handleEdit = (u) => {
    setEditTarget({
      ...u,
      role: Array.isArray(u.roles) ? u.roles[0] : u.role || "ROLE_USER",
      // Map managerId from the user object so the dropdown pre-selects correctly
      managerId: u.managerId ?? null,
    });
    setEditDialogOpen(true);
  };

  const handleDelete = (u) => {
    setDeleteTarget(u);
  };

  const confirmDelete = async () => {
    try {
      const res = await deleteUser(deleteTarget.id);
      toast.success(res.data?.message || "User deleted successfully");
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Failed to delete user. Please try again.";
      toast.error(msg);
      throw err;
    }
  };

  const handleSave = async (form, photoFile) => {
    if (editTarget?.id) {
      // Build the dto payload with all fields including role and managerId
      const dto = {
        firstName: form.firstName,
        lastName: form.lastName,
        username: form.username,
        email: form.email,
        gender: form.gender || undefined,
        location: form.location || undefined,
        designation: form.designation || undefined,
        typeOfEmployment: form.typeOfEmployment || undefined,
        role: form.role || "ROLE_USER",
        managerId:
          form.role === "ROLE_USER" || !form.role
            ? form.managerId
              ? Number(form.managerId)
              : null
            : null,
      };
      // Include password only if the admin explicitly filled it in
      if (form.password) dto.password = form.password;

      // Use the /users/{id} endpoint (JSON) so role + managerId are accepted
      const response = await updateUserAdmin(editTarget.id, dto).catch(
        (err) => {
          const msg =
            err.response?.data?.message ||
            "Failed to update user. Please try again.";
          toast.error(msg);
          throw err;
        },
      );

      // Upload photo separately if one was selected
      if (photoFile) {
        await updateUserPhoto(editTarget.id, photoFile).catch(() => {
          toast.error("User updated but photo upload failed.");
        });
      }

      toast.success(`User "${response.data.username}" updated successfully`);
      await fetchUsers(); // re-fetch to reflect server state
    } else {
      // Create: POST /users with managerId (required for ROLE_USER)
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        username: form.username,
        email: form.email,
        password: form.password,
        gender: form.gender || undefined,
        location: form.location || undefined,
        designation: form.designation || undefined,
        typeOfEmployment: form.typeOfEmployment || undefined,
        role: form.role || "ROLE_USER",
        managerId:
          form.role === "ROLE_USER" || !form.role
            ? Number(form.managerId)
            : null,
      };
      const response = await createUser(payload).catch((err) => {
        const status = err.response?.status;
        const data = err.response?.data;
        if (status === 409) {
          toast.error(data?.message || "Username or email already exists.");
        } else if (status === 404 && data?.message?.includes("Manager")) {
          toast.error(data.message);
        } else {
          toast.error(
            data?.message || "Failed to create user. Please try again.",
          );
        }
        throw err; // re-throw so dialog can parse field-level errors
      });
      toast.success(
        response.data?.message ||
          `User "${response.data?.username}" created successfully`,
      );
      await fetchUsers(); // re-fetch list from server
    }
  };

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
          ml: 0,
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

        {/* Page content */}
        <Box
          sx={{
            pt: { xs: 8, sm: 9 },
            px: { xs: 1.5, sm: 2 },
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
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <PeopleIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  User Management
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.75, mt: 0.25 }}>
                  Manage system users, roles, and access levels.
                </Typography>
              </Box>
            </Box>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreate}
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
              Create User
            </Button>
          </Box>

          {/* User list table */}
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
                  All Users
                </Typography>
                <Chip
                  label={`${users.length} user${users.length !== 1 ? "s" : ""}`}
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
                      <TableCell sx={{ fontWeight: 700, color: "#475569" }}>
                        User
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#475569" }}>
                        Email
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#475569" }}>
                        Role
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#475569" }}>
                        Assigned Projects
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
                    {usersLoading && (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                          <CircularProgress size={32} />
                        </TableCell>
                      </TableRow>
                    )}

                    {!usersLoading &&
                      users.map((u) => (
                        <TableRow
                          key={u.id}
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
                                src={
                                  u.photoUrl
                                    ? `http://localhost:8080/${u.photoUrl}`
                                    : undefined
                                }
                                sx={{
                                  width: 34,
                                  height: 34,
                                  bgcolor: "#1565c0",
                                  fontSize: 13,
                                  fontWeight: 700,
                                }}
                              >
                                {u.firstName?.[0]?.toUpperCase() ||
                                  u.username?.[0]?.toUpperCase()}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight={600}>
                                  {u.firstName} {u.lastName}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  @{u.username}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>

                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {u.email}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            {(u.roles || [u.role]).map((r) => (
                              <RoleChip key={r} role={r} />
                            ))}
                          </TableCell>

                          <TableCell sx={{ maxWidth: 220 }}>
                            <Box
                              sx={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 0.5,
                              }}
                            >
                              {usersLoading ? (
                                <CircularProgress size={14} />
                              ) : (userProjectsMap[u.id] || []).length === 0 ? (
                                <Typography
                                  variant="caption"
                                  color="text.disabled"
                                >
                                  None
                                </Typography>
                              ) : (
                                (userProjectsMap[u.id] || []).map((p) => (
                                  <Chip
                                    key={p.id}
                                    label={p.name}
                                    size="small"
                                    sx={{
                                      fontSize: 11,
                                      fontWeight: 600,
                                      height: 22,
                                      bgcolor: "rgba(25,118,210,0.09)",
                                      color: "#1565c0",
                                      border: "1px solid rgba(25,118,210,0.25)",
                                    }}
                                  />
                                ))
                              )}
                            </Box>
                          </TableCell>

                          <TableCell>
                            <StatusChip status={u.status || "Active"} />
                          </TableCell>

                          <TableCell align="center">
                            <Tooltip title="Edit user">
                              <IconButton
                                size="small"
                                onClick={() => handleEdit(u)}
                                sx={{ color: "#1976d2", mr: 0.5 }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete user">
                              <IconButton
                                size="small"
                                onClick={() => handleDelete(u)}
                                sx={{ color: "#d32f2f" }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}

                    {!usersLoading && users.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          align="center"
                          sx={{ py: 8, color: "text.secondary" }}
                        >
                          <Typography variant="body1" fontWeight={500}>
                            No data found
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ mt: 0.5, color: "text.disabled" }}
                          >
                            Click &quot;Create User&quot; to add the first user.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Create dialog */}
      <UserDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
        initial={null}
      />

      {/* Edit dialog — uses EditUserForm with useUpdateUser hook */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Edit User</DialogTitle>
        <DialogContent dividers sx={{ pt: 2 }}>
          {editTarget && (
            <EditUserForm
              key={editTarget.id}
              user={editTarget}
              onSuccess={async () => {
                setEditDialogOpen(false);
                await fetchUsers();
              }}
              onCancel={() => setEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <DeleteConfirmDialog
        open={Boolean(deleteTarget)}
        user={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </Box>
  );
};

export default UserManagement;
