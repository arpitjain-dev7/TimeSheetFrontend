import { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Typography,
  Button,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import TimesheetCard from "../../components/timesheet/TimesheetCard";
import CreateTimesheetModal from "../../components/timesheet/CreateTimesheetModal";
import Pagination from "../../components/shared/Pagination";
import { useTimesheets } from "../../hooks/useTimesheets";

const MyTimesheetsPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { timesheets, loading, currentPage, totalPages, fetchTimesheets } =
    useTimesheets();
  const SIDEBAR_WIDTH = sidebarOpen ? 240 : 72;

  useEffect(() => {
    fetchTimesheets(0);
  }, [fetchTimesheets]);
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

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
          {/* Header */}
          <Box
            sx={{
              mb: 3,
              p: 3,
              borderRadius: 3,
              background:
                "linear-gradient(135deg,#1a237e 0%,#283593 60%,#01579b 100%)",
              color: "#fff",
              boxShadow: "0 8px 32px rgba(26,35,126,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="h6" fontWeight={700}>
                My Timesheets
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.75, mt: 0.25 }}>
                Create, manage, and submit your time entries
              </Typography>
            </Box>
            <Button
              onClick={() => setShowCreateModal(true)}
              variant="contained"
              startIcon={<AddIcon />}
              sx={{
                bgcolor: "rgba(255,255,255,0.15)",
                color: "#fff",
                fontWeight: 700,
                borderRadius: 2,
                border: "1px solid rgba(255,255,255,0.3)",
                backdropFilter: "blur(8px)",
                "&:hover": { bgcolor: "rgba(255,255,255,0.25)" },
                textTransform: "none",
              }}
            >
              Create New Timesheet
            </Button>
          </Box>

          {/* Content */}
          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                py: 12,
              }}
            >
              <CircularProgress size={48} />
            </Box>
          ) : timesheets.length === 0 ? (
            <Box
              sx={{
                textAlign: "center",
                py: 12,
                bgcolor: "#fff",
                borderRadius: 3,
                border: "1px solid",
                borderColor: "grey.200",
              }}
            >
              <Typography variant="h2" sx={{ mb: 1.5 }}>
                ðŸ“‹
              </Typography>
              <Typography variant="h6" fontWeight={600} color="text.secondary">
                No timesheets found
              </Typography>
              <Typography
                variant="body2"
                color="text.disabled"
                sx={{ mt: 0.5 }}
              >
                Click &quot;Create New Timesheet&quot; to get started.
              </Typography>
            </Box>
          ) : (
            <>
              <Grid container spacing={3}>
                {timesheets.map((ts) => (
                  <Grid item xs={12} sm={6} lg={4} key={ts.id}>
                    <TimesheetCard timesheet={ts} />
                  </Grid>
                ))}
              </Grid>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => fetchTimesheets(page)}
              />
            </>
          )}
        </Box>
      </Box>

      {showCreateModal && (
        <CreateTimesheetModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => fetchTimesheets(0)}
        />
      )}
    </Box>
  );
};

export default MyTimesheetsPage;
