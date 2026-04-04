import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  CircularProgress,
  Chip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SendIcon from "@mui/icons-material/Send";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import StatusBadge from "../../components/timesheet/StatusBadge";
import AddEntryForm from "../../components/timesheet/AddEntryForm";
import EntryRow from "../../components/timesheet/EntryRow";
import ConfirmDialog from "../../components/shared/ConfirmDialog";
import {
  getTimesheetById,
  submitTimesheet,
  deleteTimesheet,
} from "../../api/timesheetApi";
import toast from "react-hot-toast";

const formatDate = (d) => {
  if (!d) return "Not set";
  try {
    const str = d.includes("T") ? d : `${d}T00:00:00`;
    return format(parseISO(str), "dd MMM yyyy");
  } catch {
    return d;
  }
};

const TimesheetDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  const [timesheet, setTimesheet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const SIDEBAR_WIDTH = sidebarOpen ? 240 : 72;

  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await getTimesheetById(id);
        setTimesheet(res.data);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load timesheet");
        navigate("/timesheets");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await submitTimesheet(id);
      setTimesheet(res.data);
      toast.success("Timesheet submitted successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit timesheet");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteTimesheet(id);
      toast.success("Timesheet deleted");
      navigate("/timesheets");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete timesheet");
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const isDraft = timesheet?.status === "DRAFT";
  const entries = timesheet?.entries || [];

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f0f4f8" }}>
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isMobile={isMobile}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: 0,
          transition: "margin-left 0.25s ease",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Navbar
          onToggleSidebar={() => setSidebarOpen((p) => !p)}
          sidebarOpen={sidebarOpen}
        />

        <Box
          sx={{
            pt: { xs: 8, sm: 9 },
            px: { xs: 1.5, sm: 2 },
            pb: 4,
            flexGrow: 1,
          }}
        >
          {/* Back button */}
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/timesheets")}
            sx={{
              mb: 2.5,
              borderRadius: 2,
              color: "text.secondary",
              textTransform: "none",
            }}
          >
            Back to My Timesheets
          </Button>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 12 }}>
              <CircularProgress size={48} />
            </Box>
          ) : !timesheet ? null : (
            <>
              {/* â”€â”€ Header Card â”€â”€ */}
              <Card
                elevation={0}
                sx={{
                  mb: 3,
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "grey.200",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  {/* Title row */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      flexWrap: "wrap",
                      gap: 2,
                      mb: 2,
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight={700}>
                        {timesheet.title || `Timesheet #${timesheet.id}`}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                      >
                        {formatDate(timesheet.periodStart)} {"to"}{" "}
                        {formatDate(timesheet.periodEnd)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <StatusBadge status={timesheet.status} />
                      <Typography
                        variant="h6"
                        fontWeight={700}
                        color="text.primary"
                      >
                        {Number(timesheet.totalHours || 0).toFixed(1)} hrs
                      </Typography>
                    </Box>
                  </Box>

                  {/* REJECTED notice */}
                  {timesheet.status === "REJECTED" &&
                    timesheet.reviewerComment && (
                      <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
                        <strong>Rejection reason: </strong>
                        {timesheet.reviewerComment}
                      </Alert>
                    )}

                  {/* APPROVED notice */}
                  {timesheet.status === "APPROVED" && (
                    <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
                      Approved by{" "}
                      <strong>{timesheet.reviewedByUsername}</strong>
                      {timesheet.reviewedAt &&
                        ` on ${formatDate(timesheet.reviewedAt.split("T")[0])}`}
                    </Alert>
                  )}

                  {/* DRAFT action buttons */}
                  {isDraft && (
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        gap: 2,
                        pt: 1,
                      }}
                    >
                      <Button
                        onClick={handleSubmit}
                        variant="contained"
                        startIcon={
                          submitting ? (
                            <CircularProgress size={14} color="inherit" />
                          ) : (
                            <SendIcon />
                          )
                        }
                        disabled={submitting || entries.length === 0}
                        sx={{
                          borderRadius: 2,
                          fontWeight: 700,
                          textTransform: "none",
                        }}
                      >
                        {submitting ? "Submittingâ€¦" : "Submit Timesheet"}
                      </Button>

                      {entries.length === 0 && (
                        <Chip
                          label="Add at least one entry to submit"
                          size="small"
                          color="warning"
                          variant="outlined"
                        />
                      )}

                      <Button
                        onClick={() => setShowDeleteConfirm(true)}
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteOutlineIcon />}
                        sx={{
                          borderRadius: 2,
                          fontWeight: 700,
                          textTransform: "none",
                          ml: "auto",
                        }}
                      >
                        Delete Timesheet
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>

              {/* â”€â”€ Entries Table â”€â”€ */}
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "grey.200",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    px: 3,
                    py: 2,
                    borderBottom: "1px solid",
                    borderColor: "grey.100",
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={700}>
                    Entries{" "}
                    <Typography
                      component="span"
                      color="text.disabled"
                      fontWeight={400}
                    >
                      ({entries.length})
                    </Typography>
                  </Typography>
                </Box>

                {entries.length === 0 ? (
                  <Box sx={{ textAlign: "center", py: 8 }}>
                    <Typography color="text.disabled">
                      No entries yet.
                      {isDraft ? " Use the form below to add one." : ""}
                    </Typography>
                  </Box>
                ) : (
                  <TableContainer component={Paper} elevation={0}>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: "grey.50" }}>
                        <TableRow>
                          {[
                            "Project",
                            "Code",
                            "Date",
                            "Hours",
                            "Description",
                            ...(isDraft ? ["Action"] : []),
                          ].map((h) => (
                            <TableCell
                              key={h}
                              sx={{
                                fontWeight: 700,
                                fontSize: 11,
                                textTransform: "uppercase",
                                letterSpacing: 0.5,
                                color: "text.disabled",
                              }}
                            >
                              {h}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {entries.map((entry) => (
                          <EntryRow
                            key={entry.id}
                            timesheetId={id}
                            entry={entry}
                            isDraft={isDraft}
                            onEntryRemoved={setTimesheet}
                          />
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Card>

              {/* â”€â”€ Add Entry Form (DRAFT only) â”€â”€ */}
              {isDraft && (
                <AddEntryForm timesheetId={id} onEntryAdded={setTimesheet} />
              )}
            </>
          )}
        </Box>
      </Box>

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete Timesheet"
        message="Are you sure you want to delete this timesheet? This action cannot be undone."
        confirmLabel={deleting ? "Deletingâ€¦" : "Delete"}
        confirmVariant="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </Box>
  );
};

export default TimesheetDetailPage;
