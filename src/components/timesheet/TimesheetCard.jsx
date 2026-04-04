import { Card, CardContent, Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import StatusBadge from "./StatusBadge";

const formatDate = (d) => {
  if (!d) return "Not set";
  try {
    const str = d.includes("T") ? d : `${d}T00:00:00`;
    return format(parseISO(str), "dd MMM yyyy");
  } catch {
    return d;
  }
};

const MetaRow = ({ label, value, bold }) => (
  <Box>
    <Typography
      variant="caption"
      sx={{
        display: "block",
        color: "text.disabled",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: 0.5,
        fontSize: 10,
        mb: 0.25,
      }}
    >
      {label}
    </Typography>
    <Typography
      variant="body2"
      fontWeight={bold ? 700 : 400}
      color={bold ? "text.primary" : "text.secondary"}
    >
      {value}
    </Typography>
  </Box>
);

const TimesheetCard = ({ timesheet }) => {
  const navigate = useNavigate();

  return (
    <Card
      elevation={0}
      onClick={() => navigate(`/timesheets/${timesheet.id}`)}
      sx={{
        borderRadius: 3,
        border: "1px solid",
        borderColor: "grey.200",
        cursor: "pointer",
        transition: "all 0.2s ease",
        "&:hover": {
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          borderColor: "primary.light",
          transform: "translateY(-2px)",
        },
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        {/* Title + Status */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2,
            gap: 1,
          }}
        >
          <Typography variant="subtitle2" fontWeight={700} sx={{ flex: 1 }}>
            {timesheet.title || `Timesheet #${timesheet.id}`}
          </Typography>
          <StatusBadge status={timesheet.status} />
        </Box>

        {/* Meta grid */}
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
          <MetaRow
            label="Period Start"
            value={formatDate(timesheet.periodStart)}
          />
          <MetaRow label="Period End" value={formatDate(timesheet.periodEnd)} />
          <MetaRow
            label="Total Hours"
            value={`${Number(timesheet.totalHours || 0).toFixed(1)} hrs`}
            bold
          />
          <MetaRow
            label="Created"
            value={formatDate(timesheet.createdAt?.split("T")[0])}
          />
        </Box>

        {/* Entries count */}
        <Box
          sx={{
            mt: 1.5,
            pt: 1.5,
            borderTop: "1px solid",
            borderColor: "grey.100",
          }}
        >
          <Typography variant="caption" color="text.disabled">
            {timesheet.entries?.length ?? 0} entr
            {timesheet.entries?.length === 1 ? "y" : "ies"}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TimesheetCard;
