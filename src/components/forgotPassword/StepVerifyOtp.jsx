import { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  DialogContent,
  DialogActions,
  Alert,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

const OTP_LENGTH = 6;
const OTP_DURATION = 600; // 10 minutes in seconds

const StepVerifyOtp = ({
  email,
  loading,
  error,
  otpExpired,
  resendKey,
  clearError,
  onSubmit,
  onResend,
  onClose,
}) => {
  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(""));
  const [timeLeft, setTimeLeft] = useState(OTP_DURATION);
  const inputRefs = useRef([]);

  // Reset timer whenever resendKey changes (OTP resent)
  useEffect(() => {
    setTimeLeft(OTP_DURATION);
    setDigits(Array(OTP_LENGTH).fill(""));
    clearError();
    if (inputRefs.current[0]) inputRefs.current[0].focus();
  }, [resendKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Countdown
  useEffect(() => {
    if (timeLeft <= 0) return;
    const id = setInterval(() => setTimeLeft((t) => (t > 0 ? t - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [timeLeft]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const handleChange = useCallback(
    (idx, val) => {
      // Allow only single digit
      const digit = val.replace(/\D/g, "").slice(-1);
      setDigits((prev) => {
        const next = [...prev];
        next[idx] = digit;
        return next;
      });
      clearError();
      if (digit && idx < OTP_LENGTH - 1) {
        inputRefs.current[idx + 1]?.focus();
      }
    },
    [clearError],
  );

  const handleKeyDown = useCallback(
    (idx, e) => {
      if (e.key === "Backspace") {
        if (digits[idx]) {
          setDigits((prev) => {
            const n = [...prev];
            n[idx] = "";
            return n;
          });
        } else if (idx > 0) {
          inputRefs.current[idx - 1]?.focus();
          setDigits((prev) => {
            const n = [...prev];
            n[idx - 1] = "";
            return n;
          });
        }
      }
      if (e.key === "ArrowLeft" && idx > 0) inputRefs.current[idx - 1]?.focus();
      if (e.key === "ArrowRight" && idx < OTP_LENGTH - 1)
        inputRefs.current[idx + 1]?.focus();
      if (e.key === "Enter") handleVerify();
    },
    [digits],
  ); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePaste = useCallback(
    (e) => {
      e.preventDefault();
      const pasted = e.clipboardData
        .getData("text")
        .replace(/\D/g, "")
        .slice(0, OTP_LENGTH);
      if (!pasted) return;
      const next = Array(OTP_LENGTH).fill("");
      pasted.split("").forEach((ch, i) => {
        next[i] = ch;
      });
      setDigits(next);
      clearError();
      const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
      inputRefs.current[focusIdx]?.focus();
    },
    [clearError],
  );

  const handleVerify = () => {
    const otp = digits.join("");
    if (otp.length < OTP_LENGTH) return;
    onSubmit(otp);
  };

  const isComplete = digits.every((d) => d !== "");

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
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" fontWeight={700} color="#fff">
            Enter OTP
          </Typography>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>
            Step 2 of 3 — Sent to {email}
          </Typography>
        </Box>
        {/* Countdown badge */}
        {timeLeft > 0 && (
          <Box
            sx={{
              bgcolor: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: 2,
              px: 1.5,
              py: 0.5,
            }}
          >
            <Typography variant="caption" fontWeight={700} color="#fff">
              {formatTime(timeLeft)}
            </Typography>
          </Box>
        )}
      </Box>

      <DialogContent sx={{ pt: 3, pb: 1 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Enter the 6-digit OTP sent to your email.
          </Typography>

          {/* HTTP 410 — OTP expired warning */}
          {otpExpired && (
            <Alert
              severity="warning"
              icon={<WarningAmberIcon />}
              sx={{ borderRadius: 2 }}
              action={
                <Button
                  size="small"
                  color="warning"
                  startIcon={<RefreshIcon fontSize="small" />}
                  onClick={onResend}
                  disabled={loading}
                  sx={{ fontWeight: 700, whiteSpace: "nowrap" }}
                >
                  Resend OTP
                </Button>
              }
            >
              OTP has expired.
            </Alert>
          )}

          {/* Generic error */}
          {error && !otpExpired && (
            <Alert
              severity="error"
              onClose={clearError}
              sx={{ borderRadius: 2 }}
            >
              {error}
            </Alert>
          )}

          {/* 6-box OTP input */}
          <Box
            sx={{
              display: "flex",
              gap: 1,
              justifyContent: "center",
            }}
            onPaste={handlePaste}
          >
            {digits.map((digit, idx) => (
              <Box
                key={idx}
                component="input"
                ref={(el) => (inputRefs.current[idx] = el)}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                autoFocus={idx === 0}
                sx={{
                  width: 44,
                  height: 52,
                  textAlign: "center",
                  fontSize: 22,
                  fontWeight: 700,
                  fontFamily: "inherit",
                  border: "2px solid",
                  borderColor: digit ? "#1976d2" : "rgba(0,0,0,0.23)",
                  borderRadius: "8px",
                  outline: "none",
                  bgcolor: digit ? "rgba(25,118,210,0.05)" : "#fff",
                  color: "#1a237e",
                  transition: "border-color 0.15s, background 0.15s",
                  "&:focus": {
                    borderColor: "#1976d2",
                    boxShadow: "0 0 0 3px rgba(25,118,210,0.15)",
                  },
                  caretColor: "transparent",
                  cursor: "pointer",
                }}
              />
            ))}
          </Box>

          {/* Timer / Resend row */}
          <Box sx={{ textAlign: "center" }}>
            {timeLeft === 0 ? (
              <Button
                size="small"
                startIcon={<RefreshIcon fontSize="small" />}
                onClick={onResend}
                disabled={loading}
                sx={{ fontWeight: 700, color: "#1976d2" }}
              >
                Resend OTP
              </Button>
            ) : (
              <Typography variant="caption" color="text.disabled">
                OTP expires in {formatTime(timeLeft)}
              </Typography>
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button onClick={onClose} sx={{ borderRadius: 2, fontWeight: 600 }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleVerify}
          disabled={loading || !isComplete}
          startIcon={
            loading ? <CircularProgress size={14} color="inherit" /> : null
          }
          sx={{
            borderRadius: 2,
            fontWeight: 700,
            minWidth: 140,
            background: "linear-gradient(90deg,#1976d2,#42a5f5)",
            "&:hover": { background: "linear-gradient(90deg,#1565c0,#2196f3)" },
            "&.Mui-disabled": { background: "rgba(0,0,0,0.12)" },
          }}
        >
          {loading ? "Verifying…" : "Verify OTP"}
        </Button>
      </DialogActions>
    </>
  );
};

export default StepVerifyOtp;
