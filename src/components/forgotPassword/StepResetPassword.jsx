import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  CircularProgress,
  DialogContent,
  DialogActions,
  Alert,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

// ─── Password strength ────────────────────────────────────────────────────────
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
              transition: "background-color 0.25s ease",
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

// ─── Component ────────────────────────────────────────────────────────────────
const StepResetPassword = ({
  loading,
  error,
  clearError,
  onSubmit,
  onClose,
}) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!newPassword) errs.newPassword = "New password is required";
    else if (newPassword.length < 8)
      errs.newPassword = "Password must be at least 8 characters";
    if (!confirmPassword) errs.confirmPassword = "Please confirm your password";
    else if (newPassword !== confirmPassword)
      errs.confirmPassword = "Passwords do not match";
    return errs;
  };

  const handleSubmit = () => {
    const errs = validate();
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      return;
    }
    clearError();
    onSubmit(newPassword, confirmPassword);
  };

  return (
    <>
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
        <LockOutlinedIcon
          sx={{ color: "rgba(255,255,255,0.85)", fontSize: 26 }}
        />
        <Box>
          <Typography variant="h6" fontWeight={700} color="#fff">
            New Password
          </Typography>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>
            Step 3 of 3 — Choose a strong password
          </Typography>
        </Box>
      </Box>

      <DialogContent sx={{ pt: 3, pb: 1 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          {error && (
            <Alert
              severity="error"
              onClose={clearError}
              sx={{ borderRadius: 2 }}
            >
              {error}
            </Alert>
          )}

          {/* New password */}
          <Box>
            <TextField
              label="New Password"
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setFieldErrors((p) => ({ ...p, newPassword: "" }));
                clearError();
              }}
              error={!!fieldErrors.newPassword}
              helperText={fieldErrors.newPassword}
              fullWidth
              size="small"
              autoFocus
              InputLabelProps={{ shrink: true }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setShowNew((v) => !v)}
                      edge="end"
                    >
                      {showNew ? (
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
            <StrengthBar password={newPassword} />
          </Box>

          {/* Confirm password */}
          <TextField
            label="Confirm Password"
            type={showConfirm ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setFieldErrors((p) => ({ ...p, confirmPassword: "" }));
            }}
            error={!!fieldErrors.confirmPassword}
            helperText={fieldErrors.confirmPassword}
            fullWidth
            size="small"
            InputLabelProps={{ shrink: true }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setShowConfirm((v) => !v)}
                    edge="end"
                  >
                    {showConfirm ? (
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
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button onClick={onClose} sx={{ borderRadius: 2, fontWeight: 600 }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={
            loading ? <CircularProgress size={14} color="inherit" /> : null
          }
          sx={{
            borderRadius: 2,
            fontWeight: 700,
            minWidth: 150,
            background: "linear-gradient(90deg,#1976d2,#42a5f5)",
            "&:hover": { background: "linear-gradient(90deg,#1565c0,#2196f3)" },
          }}
        >
          {loading ? "Resetting…" : "Reset Password"}
        </Button>
      </DialogActions>
    </>
  );
};

export default StepResetPassword;
