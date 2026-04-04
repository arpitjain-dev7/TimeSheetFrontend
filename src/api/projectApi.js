import axiosInstance from './axiosInstance';

/** Get the projects assigned to the currently logged-in user */
export const getMyProjects = () => axiosInstance.get('/api/projects/my');
