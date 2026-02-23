import apiClient from './api';

/**
 * Progress Service
 * Handles all API calls related to workout logging and progress tracking
 */

const progressService = {
  // ============================================
  // WORKOUT LOGGING ENDPOINTS
  // ============================================

  /**
   * Start a new workout log
   * @param {Object} logData - Workout log data
   * @param {number} logData.workoutDayId - Workout day ID
   * @param {string} logData.completedDate - Completion date (YYYY-MM-DD)
   * @returns {Promise<Object>} Created workout log
   */
  startWorkout: async (logData) => {
    const response = await apiClient.post('/logs/start', logData);
    return response.data;
  },

  /**
   * Sync manual workout header and sets in one request
   * @param {Object} payload - Full manual workout payload
   * @returns {Promise<Object>} Sync result with canonical exercise logs
   */
  syncManualWorkout: async (payload) => {
    const response = await apiClient.put('/logs/manual/sync', payload);
    return response.data;
  },

  /**
   * Log a single set
   * @param {number} workoutLogId - Workout log ID
   * @param {Object} setData - Set data
   * @param {number} setData.exerciseId - Exercise ID
   * @param {number} setData.setNumber - Set number (1, 2, 3, etc.)
   * @param {number} setData.repsCompleted - Reps completed
   * @param {number} setData.weightKg - Weight in kilograms
   * @param {string} [setData.notes] - Optional notes
   * @returns {Promise<Object>} Created exercise log
   */
  logSet: async (workoutLogId, setData) => {
    const response = await apiClient.post(`/logs/${workoutLogId}/sets`, setData);
    return response.data;
  },

  /**
   * Update a logged set
   * @param {number} exerciseLogId - Exercise log ID
   * @param {Object} setData - Updated set data
   * @returns {Promise<Object>} Updated exercise log
   */
  updateSet: async (exerciseLogId, setData) => {
    const response = await apiClient.put(`/logs/sets/${exerciseLogId}`, setData);
    return response.data;
  },

  /**
   * Delete a logged set
   * @param {number} exerciseLogId - Exercise log ID
   * @returns {Promise<Object>} Success message
   */
  deleteSet: async (exerciseLogId) => {
    const response = await apiClient.delete(`/logs/sets/${exerciseLogId}`);
    return response.data;
  },

  /**
   * Complete a workout
   * @param {number} workoutLogId - Workout log ID
   * @param {Object} completionData - Completion data
   * @param {string} [completionData.notes] - Optional workout notes
   * @returns {Promise<Object>} Updated workout log
   */
  completeWorkout: async (workoutLogId, completionData = {}) => {
    const response = await apiClient.put(`/logs/${workoutLogId}/complete`, completionData);
    return response.data;
  },

  /**
   * Get workout log details
   * @param {number} workoutLogId - Workout log ID
   * @returns {Promise<Object>} Log with all sets
   */
  getWorkoutLog: async (workoutLogId) => {
    const response = await apiClient.get(`/logs/${workoutLogId}`);
    return response.data;
  },

  /**
   * Delete workout log
   * @param {number} workoutLogId - Workout log ID
   * @returns {Promise<Object>} Success message
   */
  deleteWorkoutLog: async (workoutLogId) => {
    const response = await apiClient.delete(`/logs/${workoutLogId}`);
    return response.data;
  },

  // ============================================
  // PROGRESS TRACKING ENDPOINTS
  // ============================================

  /**
   * Get workout history
   * @param {Object} [filters] - Optional filters
   * @param {string} [filters.startDate] - Start date (YYYY-MM-DD)
   * @param {string} [filters.endDate] - End date (YYYY-MM-DD)
   * @param {number} [filters.limit] - Limit results
   * @returns {Promise<Array>} Array of workout logs
   */
  getWorkoutHistory: async (filters = {}) => {
    const response = await apiClient.get('/progress/history', { params: filters });
    return response.data;
  },

  /**
   * Get exercise-specific progress
   * @param {number} exerciseId - Exercise ID
   * @param {Object} [options] - Optional parameters
   * @param {number} [options.limit] - Limit results
   * @returns {Promise<Array>} Exercise logs with progression
   */
  getExerciseProgress: async (exerciseId, options = {}) => {
    const response = await apiClient.get(`/progress/exercise/${exerciseId}`, { params: options });
    return response.data;
  },

  /**
   * Get recent workouts
   * @param {number} [limit=10] - Number of recent workouts to fetch
   * @returns {Promise<Array>} Recent workout logs
   */
  getRecentWorkouts: async (limit = 10) => {
    const response = await apiClient.get('/progress/recent', { params: { limit } });
    return response.data;
  },

  /**
   * Get personal records for an exercise
   * @param {number} exerciseId - Exercise ID
   * @returns {Promise<Object>} Personal records (max weight, max reps, etc.)
   */
  getPersonalRecords: async (exerciseId) => {
    const response = await apiClient.get(`/progress/exercise/${exerciseId}/records`);
    return response.data;
  },

  /**
   * Get workout statistics
   * @param {Object} [dateRange] - Optional date range
   * @param {string} [dateRange.startDate] - Start date (YYYY-MM-DD)
   * @param {string} [dateRange.endDate] - End date (YYYY-MM-DD)
   * @returns {Promise<Object>} Statistics (total workouts, volume, etc.)
   */
  getWorkoutStats: async (dateRange = {}) => {
    const response = await apiClient.get('/progress/stats', { params: dateRange });
    return response.data;
  },

  /**
   * Get progress data for charts
   * @param {number} exerciseId - Exercise ID
   * @param {string} metric - Metric to track ('weight', 'reps', 'volume')
   * @param {Object} [dateRange] - Optional date range
   * @returns {Promise<Array>} Chart data points
   */
  getProgressChartData: async (exerciseId, metric = 'weight', dateRange = {}) => {
    const response = await apiClient.get(`/progress/exercise/${exerciseId}/chart`, {
      params: { metric, ...dateRange }
    });
    return response.data;
  },

};

export default progressService;
