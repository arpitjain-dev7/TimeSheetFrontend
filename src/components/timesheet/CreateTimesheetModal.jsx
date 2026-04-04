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
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CloseIcon from "@mui/icons-material/Close";
import DateRangeIcon from "@mui/icons-material/DateRange";
import { createTimesheet } from "../../api/timesheetApi";
import toast from "react-hot-toast";

const CreateTimesheetModal = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({ title: "", periodStart: "", periodEnd: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (form.periodStart && form.periodEnd && form.periodEnd < form.periodStart) {
      errs.periodEnd = "End date must not be before start date";
    }
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const res = await createTimesheet(form);
      toast.success("Timesheet created!");
      onCreated(res.data);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create timesheet");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open
      onClose={!loading ? onClose : undefined}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          overflow: "hidden",
          boxShadow: "0 24px 60px rgba(26,35,126,0.2)",
        },
      }}
    >
      {/*  Gradient Header  */}
      <Box
        sx={{
          background: "linear-gradient(135deg,#1a237e 0%,#283593 60%,#01579b 100%)",
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
          <CalendarMonthIcon sx={{ color: "#fff", fontSize: 24 }} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" fontWeight={700} color="#fff" lineHeight={1.25}>
            Create New Timesheet
          </Typography>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.75)" }}>
            Fill in the details to create a new timesheet period
          </Typography>
        </Box>
        <IconButton
          onClick={!loading ? onClose : undefined}
          size="small"
          sx={{
            color: "rgba(255,255,255,0.8)",
            "&:hover": { bgcolor: "rgba(255,255,255,0.12)" },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/*  Form Fields  */}
      <DialogContent sx={{ px: 3, pt: 3, pb: 1 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          <TextField
            label="Timesheet Title"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Week 1 - April 2026"
            fullWidth
            InputLabelProps={{ shrink: true }}
            helperText="Optional - leave blank for auto-title"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                "&:hover fieldset": { borderColor: "#3949ab" },
                "&.Mui-focused fieldset": { borderColor: "#1a237e" },
              },
              "& .MuiInputLabel-root.Mui-focused": { color: "#1a237e" },
            }}
          />
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Period Start"
              name="periodStart"
              type="date"
              value={form.periodStart}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "&:hover fieldset": { borderColor: "#3949ab" },
                  "&.Mui-focused fieldset": { borderColor: "#1a237e" },
                },
                "& .MuiInputLabel-root.Mui-focused": { color: "#1a237e" },
              }}
            />
            <TextField
              label="Period End"
              name="periodEnd"
              type="date"
              value={form.periodEnd}
              onChange={handleChange}
              error={!!errors.periodEnd}
              helperText={errors.periodEnd}
              fullWidth
              InputLabelProps={{ shrink: true }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "&:hover fieldset": { borderColor: "#3949ab" },
                  "&.Mui-focused fieldset": { borderColor: "#1a237e" },
                },
                "& .MuiInputLabel-root.Mui-focused": { color: "#1a237e" },
              }}
            />
          </Box>
        </Box>
      </DialogContent>

      <Divider sx={{ mt: 2 }} />

      {/*  Actions  */}
      <DialogActions sx={{ px: 3, py: 2, gap: 1.5 }}>
        <Button
          onClick={onClose}
          disabled={loading}
          variant="outlined"
          sx={{
            borderRadius: 2,
            fontWeight: 600,
            borderColor: "#c5cae9",
            color: "#3949ab",
            "&:hover": { borderColor: "#3949ab", bgcolor: "rgba(57,73,171,0.04)" },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          sx={{
            borderRadius: 2,
            fontWeight: 700,
            minWidth: 165,
            background: "linear-gradient(135deg,#1a237e,#01579b)",
            "&:hover": { background: "linear-gradient(135deg,#283593,#0277bd)" },
            boxShadow: "0 4px 14px rgba(26,35,126,0.35)",
          }}
          startIcon={
            loading ? (
              <CircularProgress size={14} color="inherit" />
            ) : (
              <DateRangeIcon />
            )
          }
        >
          {loading ? "Creating..." : "Create Timesheet"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateTimesheetModal;