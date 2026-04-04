import axiosInstance from './axiosInstance';

// ─── User Timesheet APIs ──────────────────────────────────────────────────────

/** Create a new timesheet (DRAFT) */
export const createTimesheet = (data) =>
  axiosInstance.post('/api/timesheets', data);

/** Get the logged-in user's timesheets, paginated */
export const getMyTimesheets = (page = 0, size = 10) =>
  axiosInstance.get('/api/timesheets/my', {
    params: { page, size, sortBy: 'createdAt', sortDir: 'desc' },
  });

/** Get a single timesheet by ID */
export const getTimesheetById = (id) =>
  axiosInstance.get(`/api/timesheets/${id}`);

/** Add an entry to a DRAFT timesheet */
export const addEntry = (timesheetId, entryData) =>
  axiosInstance.post(`/api/timesheets/${timesheetId}/entries`, entryData);

/** Remove an entry from a DRAFT timesheet */
export const removeEntry = (timesheetId, entryId) =>
  axiosInstance.delete(`/api/timesheets/${timesheetId}/entries/${entryId}`);

/** Submit a DRAFT timesheet (DRAFT → SUBMITTED) */
export const submitTimesheet = (timesheetId) =>
  axiosInstance.post(`/api/timesheets/${timesheetId}/submit`);

/** Delete a DRAFT timesheet */
export const deleteTimesheet = (timesheetId) =>
  axiosInstance.delete(`/api/timesheets/${timesheetId}`);

// ─── Manager APIs ─────────────────────────────────────────────────────────────

/** Filter all timesheets (manager view) */
export const filterTimesheets = (filters = {}, page = 0, size = 10) =>
  axiosInstance.get('/api/manager/timesheets', {
    params: { ...filters, page, size, sortBy: 'createdAt', sortDir: 'desc' },
  });

/** Approve a SUBMITTED timesheet */
export const approveTimesheet = (id) =>
  axiosInstance.put(`/api/manager/timesheets/${id}/approve`);

/** Reject a SUBMITTED timesheet with a comment */
export const rejectTimesheet = (id, comment) =>
  axiosInstance.put(`/api/manager/timesheets/${id}/reject`, {
    status: 'REJECTED',
    comment,
  });
