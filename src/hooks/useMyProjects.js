import { useState, useEffect } from 'react';
import { getMyProjects } from '../api/projectApi';
import toast from 'react-hot-toast';

/**
 * Custom hook that loads the projects assigned to the logged-in user.
 * Used by AddEntryForm to populate the project dropdown.
 */
export const useMyProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchProjects = async () => {
      setLoading(true);
      try {
        const res = await getMyProjects();
        if (!cancelled) {
          setProjects(Array.isArray(res.data) ? res.data : []);
        }
      } catch (err) {
        if (!cancelled) {
          const msg = err.response?.data?.message || 'Failed to load projects';
          setError(msg);
          toast.error(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProjects();
    return () => {
      cancelled = true;
    };
  }, []);

  return { projects, loading, error };
};
