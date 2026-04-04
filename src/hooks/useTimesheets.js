import { useState, useCallback } from 'react';
import { getMyTimesheets } from '../api/timesheetApi';
import toast from 'react-hot-toast';

/**
 * Custom hook to manage the authenticated user's timesheet list.
 * Provides fetch, pagination state, and the list data.
 */
export const useTimesheets = () => {
  const [timesheets, setTimesheets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  const fetchTimesheets = useCallback(async (page = 0, size = 10) => {
    setLoading(true);
    try {
      const res = await getMyTimesheets(page, size);
      const data = res.data;
      setTimesheets(data.timesheets || []);
      setCurrentPage(data.currentPage ?? page);
      setTotalPages(data.totalPages ?? 1);
      setTotalItems(data.totalItems ?? 0);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load timesheets');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    timesheets,
    loading,
    currentPage,
    totalPages,
    totalItems,
    fetchTimesheets,
  };
};
