import axios from 'axios';

/**
 * Axios instance for all timesheet/project API calls.
 * Base URL points to the Spring Boot backend.
 * JWT token is read from localStorage and attached automatically.
 */
const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every outgoing request
// Skip for public auth endpoints to avoid sending stale tokens
axiosInstance.interceptors.request.use(
  (config) => {
    const isAuthEndpoint = config.url?.includes('/auth/');
    if (!isAuthEndpoint) {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// On 401 (except login), clear storage and redirect to login
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    if (error.response?.status === 401 && !url.includes('/auth/login')) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
