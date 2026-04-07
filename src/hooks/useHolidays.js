import { useState, useEffect } from 'react';

/**
 * Fetches public holidays from the Google Calendar API for a given year.
 *
 * Setup:
 *   1. Create a Google Cloud project and enable the Google Calendar API.
 *   2. Create an API key (no OAuth needed for public calendars).
 *   3. Add  VITE_GOOGLE_CALENDAR_API_KEY=your_key  to your .env file.
 *   4. (Optional) Change CALENDAR_ID to match your region:
 *        India   → en.indian%23holiday%40group.v.calendar.google.com
 *        US      → en.usa%23holiday%40group.v.calendar.google.com
 *        UK      → en.uk%23holiday%40group.v.calendar.google.com
 *
 * Returns:
 *   holidays  – Set<string> of 'YYYY-MM-DD' date strings
 *   loading   – boolean
 *   error     – string | null
 */

const CALENDAR_ID =
  import.meta.env.VITE_HOLIDAY_CALENDAR_ID ||
  'en.indian%23holiday%40group.v.calendar.google.com';

const API_KEY = import.meta.env.VITE_GOOGLE_CALENDAR_API_KEY;

// In-memory cache so we only fetch once per year per session
const cache = {};

const useHolidays = (year = new Date().getFullYear()) => {
  const [holidays, setHolidays] = useState(() => cache[year] || new Set());
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);

  useEffect(() => {
    if (!API_KEY) {
      // No API key configured — holidays won't be checked, weekends still blocked
      return;
    }

    if (cache[year]) {
      setHolidays(cache[year]);
      return;
    }

    setLoading(true);
    setError(null);

    const timeMin = encodeURIComponent(`${year}-01-01T00:00:00Z`);
    const timeMax = encodeURIComponent(`${year}-12-31T23:59:59Z`);
    const url =
      `https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events` +
      `?key=${API_KEY}&timeMin=${timeMin}&timeMax=${timeMax}` +
      `&singleEvents=true&orderBy=startTime&maxResults=100`;

    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`Calendar API error: ${r.status}`);
        return r.json();
      })
      .then((data) => {
        const dates = new Set(
          (data.items || [])
            .map((item) => item.start?.date)   // all-day events have start.date (not dateTime)
            .filter(Boolean),
        );
        cache[year] = dates;
        setHolidays(dates);
      })
      .catch((err) => {
        console.warn('[useHolidays]', err.message);
        setError('Could not load holidays from Google Calendar.');
      })
      .finally(() => setLoading(false));
  }, [year]);

  return { holidays, loading, error };
};

export default useHolidays;
