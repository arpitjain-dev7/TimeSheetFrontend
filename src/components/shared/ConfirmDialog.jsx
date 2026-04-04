import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

const ConfirmDialog = ({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  confirmVariant = "danger",
  loading = false,
  onConfirm,
  onCancel,
}) => {
  const isDanger = confirmVariant === "danger";

  return (
    <Dialog
      open={open}
      onClose={!loading ? onCancel : undefined}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          overflow: "visible",
          boxShadow: isDanger
            ? "0 24px 60px rgba(183,28,28,0.2)"
            : "0 24px 60px rgba(26,35,126,0.2)",
          mt: 6,
        },
      }}
    >
      {/*  Floating Icon Badge  */}
      <Box sx={{ display: "flex", justifyContent: "center", mt: -5, mb: 1 }}>
        <Box
          sx={{
            width: 70,
            height: 70,
            borderRadius: "50%",
            bgcolor: isDanger ? "#fff3e0" : "#e8eaf6",
            border: "4px solid #fff",
            boxShadow: isDanger
              ? "0 4px 20px rgba(239,108,0,0.3)"
              : "0 4px 20px rgba(26,35,126,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {isDanger ? (
            <WarningAmberRoundedIcon sx={{ fontSize: 34, color: "#ef6c00" }} />
          ) : (
            <CheckCircleOutlineIcon sx={{ fontSize: 34, color: "#3949ab" }} />
          )}
        </Box>
      </Box>

      {/*  Content  */}
      <DialogContent sx={{ textAlign: "center", pt: 0.5, pb: 2, px: 3 }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
        {isDanger && (
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
        )}
      </DialogContent>

      {/*  Actions  */}
      <DialogActions sx={{ px: 3, pb: 3, pt: 0, gap: 1.5, justifyContent: "center" }}>
        <Button
          onClick={onCancel}
          disabled={loading}
          variant="outlined"
          sx={{
            borderRadius: 2,
            fontWeight: 600,
            minWidth: 100,
            borderColor: "#e0e0e0",
            color: "text.secondary",
            "&:hover": { borderColor: "#bdbdbd", bgcolor: "grey.50" },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          disabled={loading}
          sx={{
            borderRadius: 2,
            fontWeight: 700,
            minWidth: 120,
            background: isDanger
              ? "linear-gradient(135deg,#b71c1c,#c62828)"
              : "linear-gradient(135deg,#1a237e,#01579b)",
            "&:hover": {
              background: isDanger
                ? "linear-gradient(135deg,#c62828,#d32f2f)"
                : "linear-gradient(135deg,#283593,#0277bd)",
            },
            boxShadow: isDanger
              ? "0 4px 14px rgba(183,28,28,0.35)"
              : "0 4px 14px rgba(26,35,126,0.3)",
          }}
          startIcon={loading ? <CircularProgress size={14} color="inherit" /> : null}
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;