import axios from 'axios';

/**
 * Base Axios instance configured with the backend API URL.
 * The base URL is read from environment variables so it can be changed
 * per environment without touching source code.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token from localStorage to every outgoing request
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global response error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || "";
    // For the login endpoint itself, let the error propagate so the UI
    // can display the server's "Invalid username/email or password" message.
    if (error.response?.status === 401 && !url.includes("/auth/login")) {
      // Token expired elsewhere – clear storage and redirect
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Auth Endpoints ───────────────────────────────────────────────────────────

/**
 * Login user
 * @param {{ usernameOrEmail: string, password: string }} credentials
 */
export const loginUser = (credentials) => api.post('/auth/login', credentials);

/**
 * Register a new user (admin action)
 * @param {{ firstName, lastName, username, email, password, gender, location, designation, managerEmail, typeOfEmployment, role }} userData
 */
export const registerUser = (userData) => api.post('/auth/register', userData);

// ─── User Endpoints ───────────────────────────────────────────────────────────

/**
 * Fetch paginated list of users
 * @param {{ page?, size?, sortBy?, sortDir? }} params
 */
export const getUsers = ({ page = 0, size = 10, sortBy = 'id', sortDir = 'asc' } = {}) =>
  api.get('/user', { params: { page, size, sortBy, sortDir } });

/**
 * Update an existing user (multipart/form-data: dto JSON blob + optional photo file)
 * @param {number} id
 * @param {{ firstName, lastName, username, email, gender, location, designation, managerEmail, typeOfEmployment, password? }} dto
 * @param {File|null} photo
 */
/**
 * Delete a user by id
 * @param {number} id
 */
export const deleteUser = (id) => api.delete(`/user/${id}`);

export const updateUser = (id, dto, photo = null) => {
  const formData = new FormData();
  formData.append('dto', new Blob([JSON.stringify(dto)], { type: 'application/json' }));
  if (photo) {
    formData.append('photo', photo);
  }
  return api.put(`/user/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// ─── Project Endpoints ────────────────────────────────────────────────────────

/**
 * Create a new project
 * @param {{ name: string, description: string }} data
 */
export const createProject = (data) => api.post('/projects', data);

/**
 * Fetch paginated list of projects
 * @param {{ activeOnly?, page?, size?, sortBy?, sortDir? }} params
 */
export const getProjects = ({ activeOnly = true, page = 0, size = 10, sortBy = 'name', sortDir = 'asc' } = {}) =>
  api.get('/projects', { params: { activeOnly, page, size, sortBy, sortDir } });

/**
 * Update an existing project
 * @param {number} id
 * @param {{ name, description, startDate, endDate, active }} data
 */
export const updateProject = (id, data) => api.put(`/projects/${id}`, data);

/**
 * Assign a project to one or more users
 * @param {{ projectId: number, userIds: number[] }} data
 */
export const assignProject = (data) => api.post('/projects/assign', data);

// ─── Timesheet Endpoints ──────────────────────────────────────────────────────

/** Fetch timesheets for the authenticated user, optionally filtered */
export const getTimesheets = ({ projectId, status, from, to } = {}) =>
  api.get('/timesheets', { params: { projectId, status, from, to } });

/** Fetch a single timesheet by id */
export const getTimesheetById = (id) => api.get(`/timesheets/${id}`);

/** Create a new timesheet entry */
export const createTimesheet = (data) => api.post('/timesheets', data);

/** Update an existing timesheet */
export const updateTimesheet = (id, data) => api.put(`/timesheets/${id}`, data);

/** Delete a timesheet */
export const deleteTimesheet = (id) => api.delete(`/timesheets/${id}`);

/** Fetch projects assigned to the logged-in user */
export const getMyProjects = () => api.get('/projects/my');

export default api;
