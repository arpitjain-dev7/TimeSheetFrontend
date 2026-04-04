import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  IconButton,
  Divider,
} from "@mui/material";
import BlockIcon from "@mui/icons-material/Block";
import CancelIcon from "@mui/icons-material/Cancel";
import CloseIcon from "@mui/icons-material/Close";
import { rejectTimesheet } from "../../api/timesheetApi";
import toast from "react-hot-toast";

const RejectModal = ({ timesheet, onClose, onRejected }) => {
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!comment.trim()) { setError("Comment is required"); return; }
    setSubmitting(true);
    try {
      await rejectTimesheet(timesheet.id, comment.trim());
      toast.success("Timesheet rejected");
      onRejected();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reject timesheet");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open
      onClose={!submitting ? onClose : undefined}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          overflow: "hidden",
          boxShadow: "0 24px 60px rgba(183,28,28,0.2)",
        },
      }}
    >
      {/*  Red Gradient Header  */}
      <Box
        sx={{
          background: "linear-gradient(135deg,#b71c1c 0%,#c62828 60%,#d32f2f 100%)",
          px: 3,
          py: 2.5,
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Box
          sx={{
            width: 46,
            height: 46,
            borderRadius: "50%",
            bgcolor: "rgba(255,255,255,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <BlockIcon sx={{ color: "#fff", fontSize: 24 }} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" fontWeight={700} color="#fff" lineHeight={1.25}>
            Reject Timesheet
          </Typography>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.75)" }}>
            Provide a reason so the employee can revise and resubmit
          </Typography>
        </Box>
        <IconButton
          onClick={!submitting ? onClose : undefined}
          size="small"
          sx={{ color: "rgba(255,255,255,0.8)", "&:hover": { bgcolor: "rgba(255,255,255,0.12)" } }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/*  Content  */}
      <DialogContent sx={{ px: 3, pt: 3, pb: 1 }}>
        {/* Timesheet info panel */}
        <Box
          sx={{
            mb: 2.5,
            p: 2,
            bgcolor: "rgba(183,28,28,0.05)",
            borderRadius: 2,
            border: "1px solid rgba(183,28,28,0.18)",
          }}
        >
          <Typography
            variant="caption"
            color="text.disabled"
            fontWeight={600}
            sx={{ textTransform: "uppercase", letterSpacing: 0.5, display: "block", mb: 0.5 }}
          >
            Rejecting
          </Typography>
          <Typography variant="body2" fontWeight={700} color="text.primary">
            {timesheet?.title || `Timesheet #${timesheet?.id}`}
          </Typography>
        </Box>

        <TextField
          label="Reason for Rejection *"
          value={comment}
          onChange={(e) => { setComment(e.target.value); setError(""); }}
          multiline
          rows={4}
          fullWidth
          error={!!error}
          helperText={error || `${comment.length}/500 characters`}
          inputProps={{ maxLength: 500 }}
          placeholder="Enter reason for rejection..."
          InputLabelProps={{ shrink: true }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              "&:hover fieldset": { borderColor: "#c62828" },
              "&.Mui-focused fieldset": { borderColor: "#b71c1c" },
            },
            "& .MuiInputLabel-root.Mui-focused": { color: "#b71c1c" },
          }}
        />
      </DialogContent>

      <Divider sx={{ mt: 2 }} />

      {/*  Actions  */}
      <DialogActions sx={{ px: 3, py: 2, gap: 1.5 }}>
        <Button
          onClick={onClose}
          disabled={submitting}
          variant="outlined"
          sx={{
            borderRadius: 2,
            fontWeight: 600,
            borderColor: "#e0e0e0",
            color: "text.secondary",
            "&:hover": { borderColor: "#bdbdbd", bgcolor: "grey.50" },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={submitting}
          startIcon={submitting ? <CircularProgress size={14} color="inherit" /> : <CancelIcon />}
          sx={{
            borderRadius: 2,
            fontWeight: 700,
            minWidth: 160,
            background: "linear-gradient(135deg,#b71c1c,#c62828)",
            "&:hover": { background: "linear-gradient(135deg,#c62828,#d32f2f)" },
            boxShadow: "0 4px 14px rgba(183,28,28,0.35)",
          }}
        >
          {submitting ? "Rejecting..." : "Confirm Reject"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RejectModal;