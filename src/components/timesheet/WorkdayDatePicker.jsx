import { useMemo } from "react";
import { TextField, InputAdornment } from "@mui/material";
import EventIcon from "@mui/icons-material/Event";

/**
 * Returns true if the given YYYY-MM-DD string falls on a weekend.
 * Uses local midnight to avoid timezone shifts.
 */
export const isWeekend = (dateStr) => {
  if (!dateStr) return false;
  const d = new Date(`${dateStr}T00:00:00`);
  const day = d.getDay(); // 0 = Sunday, 6 = Saturday
  return day === 0 || day === 6;
};

/**
 * Returns an error string if the date is a non-working day, otherwise null.
 *
 * @param {string}     dateStr  'YYYY-MM-DD'
 * @param {Set<string>} holidays set of 'YYYY-MM-DD' holiday strings
 */
export const getWorkdayError = (dateStr, holidays = new Set()) => {
  if (!dateStr) return null;
  if (isWeekend(dateStr))
    return "Weekends are not working days. Please select a weekday.";
  if (holidays.has(dateStr))
    return "This date is a public holiday. Please select a working day.";
  return null;
};

/**
 * WorkdayDatePicker
 *
 * A drop-in replacement for a plain <TextField type="date"> that:
 *   • Keeps the native date input (same date format — no format change)
 *   • Shows an inline error when the user picks a weekend or public holiday
 *   • Accepts a `holidays` Set<string> from `useHolidays` for holiday checking
 *
 * Props:
 *   name           {string}
 *   value          {string}   YYYY-MM-DD
 *   onChange       {function} receives the original SyntheticEvent
 *   holidays       {Set<string>}  optional — from useHolidays hook
 *   error          {boolean}  external error flag (e.g. from validate())
 *   helperText     {string}   external helper / error text
 *   label          {string}
 *   fullWidth      {boolean}
 *   sx             {object}   passed to TextField
 *   InputProps     {object}   extra InputProps merged in
 */
const WorkdayDatePicker = ({
  name,
  value,
  onChange,
  holidays = new Set(),
  error: externalError = false,
  helperText: externalHelperText = "",
  label = "Work Date *",
  fullWidth = true,
  sx,
  InputProps: extraInputProps = {},
}) => {
  // Compute the workday error for the currently selected date
  const workdayError = useMemo(
    () => getWorkdayError(value, holidays),
    [value, holidays],
  );

  const hasError = externalError || !!workdayError;
  const displayText = workdayError || externalHelperText;

  return (
    <TextField
      label={label}
      name={name}
      type="date"
      value={value}
      onChange={onChange}
      error={hasError}
      helperText={displayText}
      fullWidth={fullWidth}
      InputLabelProps={{ shrink: true }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <EventIcon sx={{ color: "#3949ab", fontSize: 18 }} />
          </InputAdornment>
        ),
        ...extraInputProps,
      }}
      sx={sx}
    />
  );
};

export default WorkdayDatePicker;
