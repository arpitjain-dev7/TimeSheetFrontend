import { useState } from "react";
import {
  TableRow,
  TableCell,
  IconButton,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { format, parseISO } from "date-fns";
import { removeEntry } from "../../api/timesheetApi";
import toast from "react-hot-toast";

const EntryRow = ({ timesheetId, entry, isDraft, onEntryRemoved }) => {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await removeEntry(timesheetId, entry.id);
      toast.success("Entry removed");
      onEntryRemoved(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove entry");
    } finally {
      setDeleting(false);
    }
  };

  const formattedDate = entry.workDate
    ? (() => {
        try {
          return format(parseISO(entry.workDate), "dd MMM yyyy");
        } catch {
          return entry.workDate;
        }
      })()
    : "Not set";

  return (
    <TableRow hover>
      <TableCell sx={{ fontWeight: 500 }}>
        {entry.projectName || "Not set"}
      </TableCell>
      <TableCell
        sx={{ color: "text.secondary", fontFamily: "monospace", fontSize: 12 }}
      >
        {entry.projectCode || "Not set"}
      </TableCell>
      <TableCell>{formattedDate}</TableCell>
      <TableCell sx={{ fontWeight: 700 }}>
        {Number(entry.hoursWorked).toFixed(1)} hrs
      </TableCell>
      <TableCell sx={{ maxWidth: 220, color: "text.secondary" }}>
        {entry.description || "Not set"}
      </TableCell>
      {isDraft && (
        <TableCell>
          <Tooltip title="Remove entry">
            <IconButton
              color="error"
              onClick={handleDelete}
              disabled={deleting}
              size="small"
            >
              {deleting ? (
                <CircularProgress size={16} color="error" />
              ) : (
                <DeleteIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
        </TableCell>
      )}
    </TableRow>
  );
};

export default EntryRow;
