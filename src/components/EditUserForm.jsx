import { useState, useEffect, useRef } from "react";
import {
  Box,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Avatar,
  Button,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import useUpdateUser from "../hooks/useUpdateUser";
import { getManagers } from "../api/userApi";

// ─── Constants ────────────────────────────────────────────────────────────────

const ROLES = ["ROLE_ADMIN", "ROLE_MANAGER", "ROLE_USER"];

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

// ─── EditUserForm ─────────────────────────────────────────────────────────────

/**
 * Pre-populated edit form for an existing user.
 *
 * Props:
 *   user       {object}   – The user to edit (from the users list).
 *   onSuccess  {function} – Called with the updated user object after save.
 *   onCancel   {function} – Called when the user clicks Cancel.
 */
const EditUserForm = ({ user, onSuccess, onCancel }) => {
  const fileRef = useRef(null);

  // ── Form state ──────────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    username: user.username || "",
    email: user.email || "",
    gender: user.gender || "",
    location: user.location || "",
    designation: user.designation || "",
    typeOfEmployment: user.typeOfEmployment || "",
    role: Array.isArray(user.roles) ? user.roles[0] : user.role || "ROLE_USER",
    managerId: user.managerId ?? null,
    password: "",
  });

  // ── Photo state ─────────────────────────────────────────────────────────────
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(
    user.photoUrl ? `http://localhost:8080/${user.photoUrl}` : null,
  );

  // ── Client-side field errors ─────────────────────────────────────────────────
  const [localErrors, setLocalErrors] = useState({});

  // ── Manager dropdown ─────────────────────────────────────────────────────────
  const [managers, setManagers] = useState([]);
  const [managersLoading, setManagersLoading] = useState(false);
  const [managersError, setManagersError] = useState(null);

  // ── Update hook ──────────────────────────────────────────────────────────────
  const {
    loading,
    error: apiError,
    fieldErrors,
    submit,
    reset,
  } = useUpdateUser(user.id);

  // Fetch managers on mount
  useEffect(() => {
    setManagersLoading(true);
    getManagers()
      .then((res) => setManagers(res.data || []))
      .catch(() => setManagersError("Failed to load managers."))
      .finally(() => setManagersLoading(false));
  }, []);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      // Clear managerId when role changes away from ROLE_USER
      if (name === "role" && value !== "ROLE_USER") {
        updated.managerId = null;
      }
      return updated;
    });
    setLocalErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleManagerChange = (e) => {
    const val = e.target.value;
    setForm((prev) => ({
      ...prev,
      managerId: val !== "" ? Number(val) : null,
    }));
    setLocalErrors((prev) => ({ ...prev, managerId: "" }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  // ── Client-side validation ───────────────────────────────────────────────────

  const validate = () => {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = "First name is required";
    if (!form.lastName.trim()) errs.lastName = "Last name is required";
    if (!form.username.trim()) errs.username = "Username is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Enter a valid email address";
    if ((form.role === "ROLE_USER" || !form.role) && !form.managerId)
      errs.managerId = "Please select a manager for this user";
    return errs;
  };

  // ── Submit ───────────────────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e?.preventDefault();

    const errs = validate();
    if (Object.keys(errs).length) {
      setLocalErrors(errs);
      return;
    }

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
    if (form.password) dto.password = form.password;

    try {
      const updated = await submit(dto, photo || null);
      onSuccess(updated);
    } catch {
      // errors already set inside useUpdateUser
    }
  };

  // Merge hook field errors with local ones (server takes precedence)
  const errors = { ...localErrors, ...fieldErrors };

  const needsManager = form.role === "ROLE_USER" || !form.role;

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      {/* Top-level API error */}
      {apiError && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={reset}>
          {apiError}
        </Alert>
      )}

      <Grid container spacing={2.5}>
        {/* First Name | Last Name */}
        <Grid item xs={12} sm={6}>
          <TextField
            label="First Name"
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            error={!!errors.firstName}
            helperText={errors.firstName}
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
            fullWidth
            size="small"
            required
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        {/* Username */}
        <Grid item xs={12} sm={6}>
          <TextField
            label="Username"
            name="username"
            value={form.username}
            onChange={handleChange}
            error={!!errors.username}
            helperText={errors.username}
            fullWidth
            size="small"
            required
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        {/* Email */}
        <Grid item xs={12} sm={6}>
          <TextField
            label="Email"
            name="email"
            value={form.email}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email}
            fullWidth
            size="small"
            required
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

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
            fullWidth
            size="small"
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        {/* Designation */}
        <Grid item xs={12} sm={6}>
          <TextField
            label="Designation"
            name="designation"
            value={form.designation}
            onChange={handleChange}
            fullWidth
            size="small"
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        {/* Manager dropdown — only for ROLE_USER */}
        {needsManager && (
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small" error={!!errors.managerId}>
              <InputLabel shrink required>
                Manager
              </InputLabel>
              <Select
                name="managerId"
                value={managersLoading ? "" : (form.managerId ?? "")}
                onChange={handleManagerChange}
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

        {/* Type of Employment */}
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

        {/* Role */}
        <Grid item xs={12} sm={needsManager ? 6 : 6}>
          <FormControl fullWidth size="small">
            <InputLabel shrink>Role</InputLabel>
            <Select
              name="role"
              value={form.role}
              onChange={handleChange}
              displayEmpty
              notched
              label="Role"
            >
              {ROLES.map((r) => (
                <MenuItem key={r} value={r}>
                  {r}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Profile Photo */}
        <Grid item xs={12}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {/* Avatar preview */}
            <Box sx={{ position: "relative", flexShrink: 0 }}>
              <Avatar
                src={photoPreview ?? undefined}
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: "#1565c0",
                  fontSize: 22,
                  fontWeight: 700,
                }}
              >
                {!photoPreview && (form.firstName?.[0] || "U").toUpperCase()}
              </Avatar>
              <Box
                onClick={() => fileRef.current?.click()}
                sx={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  bgcolor: "rgba(0,0,0,0.45)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: 0,
                  transition: "opacity 0.2s",
                  cursor: "pointer",
                  "&:hover": { opacity: 1 },
                }}
              >
                <PhotoCameraIcon sx={{ color: "#fff", fontSize: 22 }} />
              </Box>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handlePhotoChange}
              />
            </Box>

            <Box>
              <Button
                variant="outlined"
                size="small"
                onClick={() => fileRef.current?.click()}
                sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
              >
                {photo ? "Change Photo" : "Upload Profile Photo"}
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
      </Grid>

      {/* Actions */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 3 }}>
        <Button onClick={onCancel} disabled={loading} sx={{ borderRadius: 2 }}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          startIcon={
            loading ? <CircularProgress size={14} color="inherit" /> : null
          }
          sx={{ borderRadius: 2, fontWeight: 700, minWidth: 130 }}
        >
          {loading ? "Saving…" : "Save Changes"}
        </Button>
      </Box>
    </Box>
  );
};

export default EditUserForm;
