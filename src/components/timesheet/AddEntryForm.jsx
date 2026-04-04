import { useState } from "react";
import {
  Box,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  Button,
  CircularProgress,
  Alert,
  InputAdornment,
  Typography,
  Paper,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import EventIcon from "@mui/icons-material/Event";
import NotesIcon from "@mui/icons-material/Notes";
import AddIcon from "@mui/icons-material/Add";
import { addEntry } from "../../api/timesheetApi";
import { useMyProjects } from "../../hooks/useMyProjects";
import toast from "react-hot-toast";

const EMPTY_FORM = { projectId: "", workDate: "", hoursWorked: "", description: "" };

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    "&:hover fieldset": { borderColor: "#3949ab" },
    "&.Mui-focused fieldset": { borderColor: "#1a237e" },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: "#1a237e" },
};

const AddEntryForm = ({ timesheetId, onEntryAdded }) => {
  const { projects, loading: projectsLoading } = useMyProjects();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setApiError("");
  };

  const validate = () => {
    const errs = {};
    if (!form.projectId) errs.projectId = "Project is required";
    if (!form.workDate) errs.workDate = "Work date is required";
    if (!form.hoursWorked) {
      errs.hoursWorked = "Hours worked is required";
    } else {
      const h = Number(form.hoursWorked);
      if (isNaN(h) || h < 0.5) errs.hoursWorked = "Minimum 0.5 hours";
      else if (h > 24) errs.hoursWorked = "Cannot exceed 24 hours";
      else if (!/^\d+(\.\d{1,2})?$/.test(String(form.hoursWorked)))
        errs.hoursWorked = "Maximum 2 decimal places allowed";
    }
    if (form.description && form.description.length > 500)
      errs.description = "Description cannot exceed 500 characters";
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    setApiError("");
    try {
      const res = await addEntry(timesheetId, {
        projectId: Number(form.projectId),
        workDate: form.workDate,
        hoursWorked: Number(form.hoursWorked),
        description: form.description,
      });
      toast.success("Entry added!");
      onEntryAdded(res.data);
      setForm(EMPTY_FORM);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to add entry";
      setApiError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        mt: 3,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "rgba(26,35,126,0.15)",
        overflow: "hidden",
        boxShadow: "0 4px 24px rgba(26,35,126,0.09)",
      }}
    >
      {/*  Gradient Header Strip  */}
      <Box
        sx={{
          background: "linear-gradient(135deg,#1a237e 0%,#283593 60%,#01579b 100%)",
          px: 3,
          py: 2,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            bgcolor: "rgba(255,255,255,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <AddCircleOutlineIcon sx={{ color: "#fff", fontSize: 20 }} />
        </Box>
        <Box>
          <Typography variant="subtitle1" fontWeight={700} color="#fff" lineHeight={1.2}>
            Add New Entry
          </Typography>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.72)" }}>
            Log your work hours for a project
          </Typography>
        </Box>
      </Box>

      {/*  Form Body  */}
      <Box sx={{ px: 3, py: 3 }}>
        {apiError && (
          <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
            {apiError}
          </Alert>
        )}

        <Grid container spacing={2.5}>
          {/* Project */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!errors.projectId} sx={fieldSx}>
              <InputLabel shrink>Project *</InputLabel>
              <Select
                name="projectId"
                value={form.projectId}
                onChange={handleChange}
                displayEmpty
                notched
                label="Project *"
                disabled={projectsLoading}
                startAdornment={
                  <InputAdornment position="start">
                    <FolderOpenIcon sx={{ color: "#3949ab", fontSize: 18 }} />
                  </InputAdornment>
                }
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="" disabled>
                  <Typography color="text.disabled">
                    {projectsLoading ? "Loading projects..." : "Select project..."}
                  </Typography>
                </MenuItem>
                {projects.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.projectId && <FormHelperText>{errors.projectId}</FormHelperText>}
            </FormControl>
          </Grid>

          {/* Work Date */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Work Date *"
              name="workDate"
              type="date"
              value={form.workDate}
              onChange={handleChange}
              error={!!errors.workDate}
              helperText={errors.workDate}
              fullWidth
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EventIcon sx={{ color: "#3949ab", fontSize: 18 }} />
                  </InputAdornment>
                ),
              }}
              sx={fieldSx}
            />
          </Grid>

          {/* Hours Worked */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Hours Worked *"
              name="hoursWorked"
              type="number"
              value={form.hoursWorked}
              onChange={handleChange}
              error={!!errors.hoursWorked}
              helperText={errors.hoursWorked || "e.g. 8 or 7.5"}
              placeholder="e.g. 8"
              fullWidth
              inputProps={{ min: 0.5, max: 24, step: 0.5 }}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AccessTimeIcon sx={{ color: "#3949ab", fontSize: 18 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Typography variant="caption" color="text.disabled" fontWeight={600}>
                      hrs
                    </Typography>
                  </InputAdornment>
                ),
              }}
              sx={fieldSx}
            />
          </Grid>

          {/* Description */}
          <Grid item xs={12}>
            <TextField
              label="Description"
              name="description"
              value={form.description}
              onChange={handleChange}
              error={!!errors.description}
              helperText={errors.description || `${form.description.length}/500 (optional)`}
              placeholder="Describe the work done today..."
              fullWidth
              multiline
              rows={3}
              inputProps={{ maxLength: 500 }}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ alignSelf: "flex-start", mt: 1.5 }}>
                    <NotesIcon sx={{ color: "#3949ab", fontSize: 18 }} />
                  </InputAdornment>
                ),
              }}
              sx={fieldSx}
            />
          </Grid>
        </Grid>

        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2.5 }}>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={14} color="inherit" /> : <AddIcon />}
            sx={{
              borderRadius: 2,
              fontWeight: 700,
              minWidth: 130,
              background: "linear-gradient(135deg,#1a237e,#01579b)",
              "&:hover": { background: "linear-gradient(135deg,#283593,#0277bd)" },
              boxShadow: "0 4px 14px rgba(26,35,126,0.3)",
            }}
          >
            {submitting ? "Adding..." : "Add Entry"}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default AddEntryForm;