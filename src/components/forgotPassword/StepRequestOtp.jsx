import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  DialogContent,
  DialogActions,
  Alert,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import EmailIcon from "@mui/icons-material/Email";

const StepRequestOtp = ({ loading, error, clearError, onSubmit, onClose }) => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const validate = () => {
    if (!email.trim()) {
      setEmailError("Email is required");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Enter a valid email address");
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    clearError();
    onSubmit(email);
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
            Forgot Password
          </Typography>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>
            Step 1 of 3 — Enter your email
          </Typography>
        </Box>
      </Box>

      <DialogContent sx={{ pt: 3, pb: 1 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Enter the email address associated with your account and we'll send
            you a 6-digit OTP.
          </Typography>

          {error && (
            <Alert
              severity="error"
              onClose={clearError}
              sx={{ borderRadius: 2 }}
            >
              {error}
            </Alert>
          )}

          <TextField
            label="Email address"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError("");
              clearError();
            }}
            error={!!emailError}
            helperText={emailError}
            fullWidth
            size="small"
            autoFocus
            InputLabelProps={{ shrink: true }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon sx={{ fontSize: 18, color: "text.disabled" }} />
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
            minWidth: 130,
            background: "linear-gradient(90deg,#1976d2,#42a5f5)",
            "&:hover": { background: "linear-gradient(90deg,#1565c0,#2196f3)" },
          }}
        >
          {loading ? "Sending…" : "Send OTP"}
        </Button>
      </DialogActions>
    </>
  );
};

export default StepRequestOtp;
