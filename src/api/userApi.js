import axiosInstance from './axiosInstance';

// ─── Manager Endpoints ────────────────────────────────────────────────────────

/**
 * Fetch all users with ROLE_MANAGER (for the manager dropdown).
 * GET /api/users/managers
 * @returns {Promise<Array<{id, firstName, lastName, email}>>}
 */
export const getManagers = () => axiosInstance.get('/api/users/managers');

// ─── User Update Endpoints ────────────────────────────────────────────────────

/**
 * Update a user's profile, role, and managerId using JSON.
 * Used when no photo is being changed.
 * PUT /api/users/{id}   Content-Type: application/json
 *
 * @param {number} id
 * @param {{
 *   firstName: string,
 *   lastName: string,
 *   username: string,
 *   email: string,
 *   gender?: string,
 *   location?: string,
 *   designation?: string,
 *   typeOfEmployment?: string,
 *   role: string,
 *   managerId: number | null,
 *   password?: string
 * }} dto
 */
export const updateUser = (id, dto) =>
  axiosInstance.put(`/api/users/${id}`, dto);

/**
 * Update a user's profile AND photo using multipart/form-data.
 * Used when a new photo file is selected.
 * PUT /api/user/{id}   Content-Type: multipart/form-data
 *
 * The Spring Boot backend expects:
 *   - Part "dto"   → Blob of JSON string with Content-Type application/json
 *   - Part "photo" → the image File
 *
 * @param {number} id
 * @param {object} dto  – same shape as updateUser dto above
 * @param {File}   photo
 */
export const updateUserWithPhoto = (id, dto, photo) => {
  const formData = new FormData();
  formData.append(
    'dto',
    new Blob([JSON.stringify(dto)], { type: 'application/json' }),
  );
  formData.append('photo', photo);
  return axiosInstance.put(`/api/user/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
