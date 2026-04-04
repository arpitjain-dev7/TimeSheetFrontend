import { Chip } from "@mui/material";

const STATUS_CONFIG = {
  DRAFT: {
    bgcolor: "rgba(120,120,120,0.12)",
    color: "#525252",
    borderColor: "#a3a3a3",
  },
  SUBMITTED: {
    bgcolor: "rgba(25,118,210,0.12)",
    color: "#1565c0",
    borderColor: "#90caf9",
  },
  APPROVED: {
    bgcolor: "rgba(76,175,80,0.12)",
    color: "#2e7d32",
    borderColor: "#81c784",
  },
  REJECTED: {
    bgcolor: "rgba(211,47,47,0.10)",
    color: "#c62828",
    borderColor: "#ef9a9a",
  },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_CONFIG[status] || STATUS_CONFIG.DRAFT;
  return (
    <Chip
      label={status}
      size="small"
      sx={{
        fontWeight: 700,
        fontSize: 11,
        bgcolor: s.bgcolor,
        color: s.color,
        border: `1px solid ${s.borderColor}`,
      }}
    />
  );
};

export default StatusBadge;
