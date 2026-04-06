import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  Tab,
  Tabs,
  Avatar,
  TextField,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert,
  Divider,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import LockIcon from "@mui/icons-material/Lock";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useAuth } from "../context/AuthContext";
import { updateUser, changePassword } from "../services/api";
import toast from "react-hot-toast";

// ─── Password strength bar ────────────────────────────────────────────────────
const getStrength = (pwd) => {
  if (!pwd) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (score <= 1) return { score, label: "Weak", color: "#f44336" };
  if (score <= 3) return { score, label: "Medium", color: "#ff9800" };
  return { score, label: "Strong", color: "#4caf50" };
};

const StrengthBar = ({ password }) => {
  const { score, label, color } = getStrength(password);
  if (!password) return null;
  return (
    <Box sx={{ mt: 0.5 }}>
      <Box sx={{ display: "flex", gap: 0.5, mb: 0.5 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Box
            key={i}
            sx={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              bgcolor: i < score ? color : "rgba(0,0,0,0.1)",
              transition: "background-color 0.2s",
            }}
          />
        ))}
      </Box>
      <Typography variant="caption" sx={{ color, fontWeight: 700 }}>
        {label}
      </Typography>
    </Box>
  );
};

// ─── Tab: Update Photo ────────────────────────────────────────────────────────
const PhotoTab = ({ user }) => {
  const { login } = useAuth();
  const fileRef = useRef(null);
  const [preview, setPreview] = useState(
    user?.photoUrl ? `http://localhost:8080/${user.photoUrl}` : null,
  );
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const initials = (u) => (u?.username || u?.email || "U")[0].toUpperCase();

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSave = async () => {
    if (!file) {
      toast.error("Please select a photo first.");
      return;
    }
    setLoading(true);
    try {
      const res = await updateUser(
        user.id,
        {
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          email: user.email,
        },
        file,
      );
      // Refresh auth context so Navbar avatar updates immediately
      const updatedPhotoUrl = res.data?.photoUrl;
      if (updatedPhotoUrl) {
        const stored = JSON.parse(localStorage.getItem("user") || "{}");
        const updated = { ...stored, photoUrl: updatedPhotoUrl };
        localStorage.setItem("user", JSON.stringify(updated));
        setPreview(`http://localhost:8080/${updatedPhotoUrl}`);
      }
      toast.success("Profile photo updated!");
      setFile(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update photo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 3,
        py: 3,
      }}
    >
      {/* Avatar preview */}
      <Box sx={{ position: "relative" }}>
        <Avatar
          src={preview}
          sx={{
            width: 100,
            height: 100,
            fontSize: 36,
            fontWeight: 700,
            bgcolor: "#1565c0",
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          }}
        >
          {!preview && initials(user)}
        </Avatar>
        <IconButton
          size="small"
          onClick={() => fileRef.current?.click()}
          sx={{
            position: "absolute",
            bottom: 0,
            right: 0,
            bgcolor: "#1976d2",
            color: "#fff",
            width: 32,
            height: 32,
            boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
            "&:hover": { bgcolor: "#1565c0" },
          }}
        >
          <PhotoCameraIcon sx={{ fontSize: 16 }} />
        </IconButton>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleFileChange}
        />
      </Box>

      <Typography variant="body2" color="text.secondary" textAlign="center">
        Click the camera icon to select a new photo.
        <br />
        Supported: JPG, PNG, WEBP
      </Typography>

      {file && (
        <Typography variant="caption" color="text.secondary">
          Selected: <strong>{file.name}</strong>
        </Typography>
      )}

      <Button
        variant="contained"
        onClick={handleSave}
        disabled={loading || !file}
        startIcon={
          loading ? <CircularProgress size={14} color="inherit" /> : null
        }
        sx={{
          borderRadius: 2,
          fontWeight: 700,
          minWidth: 160,
          background: "linear-gradient(90deg,#1976d2,#42a5f5)",
          "&:hover": { background: "linear-gradient(90deg,#1565c0,#2196f3)" },
          "&.Mui-disabled": { background: "rgba(0,0,0,0.12)" },
        }}
      >
        {loading ? "Saving…" : "Save Photo"}
      </Button>
    </Box>
  );
};

// ─── Tab: Change Password ─────────────────────────────────────────────────────
const PasswordTab = () => {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [show, setShow] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleShow = (field) => setShow((p) => ({ ...p, [field]: !p[field] }));

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setErrors((p) => ({ ...p, [e.target.name]: "" }));
    setApiError("");
  };

  const validate = () => {
    const errs = {};
    if (!form.currentPassword)
      errs.currentPassword = "Current password is required";
    if (!form.newPassword) errs.newPassword = "New password is required";
    else if (form.newPassword.length < 8)
      errs.newPassword = "Minimum 8 characters";
    if (!form.confirmPassword)
      errs.confirmPassword = "Please confirm your new password";
    else if (form.newPassword !== form.confirmPassword)
      errs.confirmPassword = "Passwords do not match";
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    setApiError("");
    try {
      await changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword,
      });
      toast.success("Password changed successfully!");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setApiError(err.response?.data?.message || "Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

  const pwField = (name, label) => (
    <Box>
      <TextField
        label={label}
        name={name}
        type={show[name] ? "text" : "password"}
        value={form[name]}
        onChange={handleChange}
        error={!!errors[name]}
        helperText={errors[name]}
        fullWidth
        size="small"
        InputLabelProps={{ shrink: true }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={() => toggleShow(name)}
                edge="end"
              >
                {show[name] ? (
                  <VisibilityOffIcon fontSize="small" />
                ) : (
                  <VisibilityIcon fontSize="small" />
                )}
              </IconButton>
            </InputAdornment>
          ),
        }}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
      />
      {name === "newPassword" && <StrengthBar password={form.newPassword} />}
    </Box>
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, py: 2 }}>
      {apiError && (
        <Alert
          severity="error"
          onClose={() => setApiError("")}
          sx={{ borderRadius: 2 }}
        >
          {apiError}
        </Alert>
      )}
      {pwField("currentPassword", "Current Password")}
      {pwField("newPassword", "New Password")}
      {pwField("confirmPassword", "Confirm New Password")}

      <Button
        variant="contained"
        onClick={handleSubmit}
        disabled={loading}
        startIcon={
          loading ? (
            <CircularProgress size={14} color="inherit" />
          ) : (
            <LockIcon fontSize="small" />
          )
        }
        sx={{
          borderRadius: 2,
          fontWeight: 700,
          alignSelf: "flex-end",
          minWidth: 180,
          background: "linear-gradient(90deg,#1976d2,#42a5f5)",
          "&:hover": { background: "linear-gradient(90deg,#1565c0,#2196f3)" },
        }}
      >
        {loading ? "Updating…" : "Change Password"}
      </Button>
    </Box>
  );
};

// ─── Main Dialog ──────────────────────────────────────────────────────────────
const SettingsDialog = ({ open, onClose }) => {
  const { user } = useAuth();
  const [tab, setTab] = useState(0);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
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
        <SettingsIcon sx={{ color: "rgba(255,255,255,0.85)", fontSize: 26 }} />
        <Box>
          <Typography variant="h6" fontWeight={700} color="#fff">
            Settings
          </Typography>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>
            {user?.username || user?.email}
          </Typography>
        </Box>
      </Box>

      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="fullWidth"
        sx={{
          borderBottom: "1px solid rgba(0,0,0,0.08)",
          "& .MuiTab-root": { fontWeight: 600, fontSize: 13 },
          "& .Mui-selected": { color: "#1976d2" },
          "& .MuiTabs-indicator": { bgcolor: "#1976d2" },
        }}
      >
        <Tab
          label="Profile Photo"
          icon={<PhotoCameraIcon fontSize="small" />}
          iconPosition="start"
        />
        <Tab
          label="Change Password"
          icon={<LockIcon fontSize="small" />}
          iconPosition="start"
        />
      </Tabs>

      <DialogContent sx={{ px: 3, pt: 2, pb: 1 }}>
        {tab === 0 && <PhotoTab user={user} />}
        {tab === 1 && <PasswordTab />}
      </DialogContent>

      <Divider />
      <DialogActions sx={{ px: 3, py: 1.5 }}>
        <Button onClick={onClose} sx={{ borderRadius: 2, fontWeight: 600 }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SettingsDialog;
