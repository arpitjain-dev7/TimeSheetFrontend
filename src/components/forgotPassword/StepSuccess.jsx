import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  DialogContent,
  DialogActions,
  LinearProgress,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useNavigate } from "react-router-dom";

const REDIRECT_SECONDS = 5;

const StepSuccess = ({ onClose }) => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(REDIRECT_SECONDS);

  useEffect(() => {
    if (countdown <= 0) {
      onClose();
      navigate("/login");
      return;
    }
    const id = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [countdown, navigate, onClose]);

  const progress = ((REDIRECT_SECONDS - countdown) / REDIRECT_SECONDS) * 100;

  return (
    <>
      <DialogContent sx={{ pt: 4, pb: 3 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            textAlign: "center",
          }}
        >
          {/* Animated checkmark */}
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              bgcolor: "rgba(76,175,80,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 48, color: "#43a047" }} />
          </Box>

          <Box>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Password Reset Successful!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your password has been updated successfully. You can now sign in
              with your new password.
            </Typography>
          </Box>

          {/* Countdown progress bar */}
          <Box sx={{ width: "100%", mt: 1 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                borderRadius: 2,
                height: 6,
                bgcolor: "rgba(0,0,0,0.08)",
                "& .MuiLinearProgress-bar": {
                  bgcolor: "#43a047",
                  borderRadius: 2,
                },
              }}
            />
            <Typography
              variant="caption"
              color="text.disabled"
              sx={{ mt: 0.75, display: "block" }}
            >
              Redirecting to sign in in {countdown}s…
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, justifyContent: "center" }}>
        <Button
          variant="contained"
          onClick={() => {
            onClose();
            navigate("/login");
          }}
          sx={{
            borderRadius: 2,
            fontWeight: 700,
            minWidth: 160,
            background: "linear-gradient(90deg,#388e3c,#66bb6a)",
            "&:hover": { background: "linear-gradient(90deg,#2e7d32,#4caf50)" },
          }}
        >
          Go to Sign In
        </Button>
      </DialogActions>
    </>
  );
};

export default StepSuccess;
