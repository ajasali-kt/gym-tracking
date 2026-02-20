import apiClient from './api';

/**
 * Get workout history for authenticated user
 * @param {string} fromDate - Start date (YYYY-MM-DD)
 * @param {string} toDate - End date (YYYY-MM-DD)
 * @returns {Promise<Object>} Workout history data
 */
export const getWorkoutHistory = async (fromDate, toDate) => {
  const response = await apiClient.get('/history', {
    params: { from: fromDate, to: toDate }
  });
  return response.data;
};

export default {
  getWorkoutHistory
};
