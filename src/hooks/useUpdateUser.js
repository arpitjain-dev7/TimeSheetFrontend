import { useState } from 'react';
import { updateUser, updateUserWithPhoto } from '../api/userApi';

/**
 * Custom hook for updating a user.
 *
 * Automatically selects the correct API call:
 *   - JSON (PUT /api/users/{id})             when no photo is provided
 *   - multipart (PUT /api/user/{id})         when a photo File is provided
 *
 * Returns { loading, error, fieldErrors, submit, reset }
 *
 * @param {number} userId
 */
const useUpdateUser = (userId) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);       // top-level error message
  const [fieldErrors, setFieldErrors] = useState({}); // per-field errors from 400 details

  /**
   * Submit the update.
   *
   * @param {object}    dto   – profile/role/managerId fields
   * @param {File|null} photo – new photo file, or null to keep current photo
   * @returns {Promise<object>} resolved response.data on success, rejects on failure
   */
  const submit = async (dto, photo = null) => {
    setLoading(true);
    setError(null);
    setFieldErrors({});

    try {
      const response = photo
        ? await updateUserWithPhoto(userId, dto, photo)
        : await updateUser(userId, dto);
      return response.data;
    } catch (err) {
      const status = err?.response?.status;
      const data   = err?.response?.data;

      if (status === 400 && data?.details && typeof data.details === 'object') {
        // Map field-level validation errors
        setFieldErrors(data.details);
        setError('Please fix the highlighted fields.');
      } else {
        setError(data?.message || 'Failed to update user. Please try again.');
      }

      throw err; // re-throw so the caller can react (e.g. keep dialog open)
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setLoading(false);
    setError(null);
    setFieldErrors({});
  };

  return { loading, error, fieldErrors, submit, reset };
};

export default useUpdateUser;
