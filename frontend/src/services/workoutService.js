import apiClient from './api';

/**
 * Workout Service
 * Handles all API calls related to workout plans, days, and dashboard
 */

const workoutService = {
  // ============================================
  // WORKOUT PLAN ENDPOINTS
  // ============================================

  /**
   * Get active workout plan
   * @returns {Promise<Object>} Active plan with all days
   */
  getActivePlan: async () => {
    const response = await apiClient.get('/plans/active');
    return response.data;
  },

  /**
   * Get plan details by ID
   * @param {number} id - Plan ID
   * @returns {Promise<Object>} Plan with days and exercises
   */
  getPlanById: async (id) => {
    const response = await apiClient.get(`/plans/${id}`);
    return response.data;
  },

  /**
   * Create new workout plan
   * @param {Object} planData - Plan data
   * @param {string} planData.name - Plan name
   * @param {string} planData.startDate - Start date (YYYY-MM-DD)
   * @param {string} [planData.endDate] - Optional end date
   * @returns {Promise<Object>} Created plan
   */
  createPlan: async (planData) => {
    const response = await apiClient.post('/plans', planData);
    return response.data;
  },

  /**
   * Delete workout plan
   * @param {number} id - Plan ID
   * @returns {Promise<Object>} Success message
   */
  deletePlan: async (id) => {
    const response = await apiClient.delete(`/plans/${id}`);
    return response.data;
  },

  /**
   * Update workout plan
   * @param {number} id - Plan ID
   * @param {Object} planData - Updated plan data
   * @returns {Promise<Object>} Updated plan
   */
  updatePlan: async (id, planData) => {
    const response = await apiClient.put(`/plans/${id}`, planData);
    return response.data;
  },

  // ============================================
  // WORKOUT DAY ENDPOINTS
  // ============================================

  /**
   * Add day to workout plan
   * @param {number} planId - Plan ID
   * @param {Object} dayData - Day data
   * @param {number} dayData.dayNumber - Day number (1-7)
   * @param {string} dayData.dayName - Day name (e.g., "Chest Day")
   * @param {number} [dayData.muscleGroupId] - Optional muscle group ID
   * @returns {Promise<Object>} Created day
   */
  addDayToPlan: async (planId, dayData) => {
    const response = await apiClient.post(`/plans/${planId}/days`, dayData);
    return response.data;
  },

  /**
   * Update workout day
   * @param {number} dayId - Day ID
   * @param {Object} dayData - Updated day data
   * @returns {Promise<Object>} Updated day
   */
  updateWorkoutDay: async (dayId, dayData) => {
    const response = await apiClient.put(`/days/${dayId}`, dayData);
    return response.data;
  },

  /**
   * Delete workout day
   * @param {number} dayId - Day ID
   * @returns {Promise<Object>} Success message
   */
  deleteWorkoutDay: async (dayId) => {
    const response = await apiClient.delete(`/days/${dayId}`);
    return response.data;
  },

  /**
   * Get workout day by ID
   * @param {number} dayId - Day ID
   * @returns {Promise<Object>} Workout day with exercises
   */
  getWorkoutDayById: async (dayId) => {
    const response = await apiClient.get(`/days/${dayId}`);
    return response.data;
  },

  // ============================================
  // WORKOUT DAY EXERCISES ENDPOINTS
  // ============================================

  /**
   * Add exercise to workout day
   * @param {number} dayId - Workout day ID
   * @param {Object} exerciseData - Exercise assignment data
   * @param {number} exerciseData.exerciseId - Exercise ID
   * @param {number} exerciseData.sets - Number of sets
   * @param {string} exerciseData.reps - Reps (e.g., "8-12" or "10")
   * @param {number} exerciseData.restSeconds - Rest time in seconds
   * @param {number} exerciseData.orderIndex - Exercise order
   * @returns {Promise<Object>} Created assignment
   */
  addExerciseToDay: async (dayId, exerciseData) => {
    const response = await apiClient.post(`/days/${dayId}/exercises`, exerciseData);
    return response.data;
  },

  /**
   * Update exercise assignment
   * @param {number} assignmentId - Assignment ID
   * @param {Object} exerciseData - Updated exercise data
   * @returns {Promise<Object>} Updated assignment
   */
  updateDayExercise: async (assignmentId, exerciseData) => {
    const response = await apiClient.put(`/day-exercises/${assignmentId}`, exerciseData);
    return response.data;
  },

  /**
   * Remove exercise from workout day
   * @param {number} assignmentId - Assignment ID
   * @returns {Promise<Object>} Success message
   */
  removeExerciseFromDay: async (assignmentId) => {
    const response = await apiClient.delete(`/day-exercises/${assignmentId}`);
    return response.data;
  },

  /**
   * Reorder exercises in a workout day
   * @param {number} dayId - Workout day ID
   * @param {Array<number>} exerciseIds - Array of exercise IDs in new order
   * @returns {Promise<Object>} Success message
   */
  reorderDayExercises: async (dayId, exerciseIds) => {
    const response = await apiClient.put(`/days/${dayId}/reorder`, { exerciseIds });
    return response.data;
  },

  // ============================================
  // DASHBOARD ENDPOINTS
  // ============================================

  /**
   * Get today's workout combined with existing workout log
   * This consolidated endpoint replaces the need for 3 separate API calls:
   * - GET /api/dashboard/today
   * - GET /api/logs/today/:workoutDayId
   * - GET /api/logs/:id
   * @returns {Promise<Object>} Today's workout with optional workout log
   */
  getTodayWorkoutWithLog: async (todayDate) => {
    const response = await apiClient.get('/dashboard/today-with-log', {
      params: { todayDate }
    });
    return response.data;
  },

  /**
   * Get workout summary statistics
   * @returns {Promise<Object>} Total workouts, recent activity
   */
  getWorkoutSummary: async () => {
    const response = await apiClient.get('/dashboard/summary');
    return response.data;
  },

  /**
   * Get all workout plans
   * @returns {Promise<Array>} Array of all plans
   */
  getAllPlans: async () => {
    const response = await apiClient.get('/plans');
    return response.data;
  },

  /**
   * Set plan as active
   * @param {number} planId - Plan ID
   * @returns {Promise<Object>} Updated plan
   */
  setActivePlan: async (planId) => {
    const response = await apiClient.put(`/plans/${planId}/activate`);
    return response.data;
  },

  /**
   * Import workout plan from JSON
   * @param {Object} planData - Complete workout plan JSON
   * @returns {Promise<Object>} Created plan with all days and exercises
   */
  importPlan: async (planData) => {
    const response = await apiClient.post('/plans/import', planData);
    return response.data;
  },

  // ============================================
  // WORKOUT LOGGING ENDPOINTS
  // ============================================

  /**
   * Start a new workout log or get existing one for today
   * @param {number} workoutDayId - Workout day ID
   * @param {string} [completedDate] - Optional date (defaults to today)
   * @returns {Promise<Object>} Created or existing workout log
   */
  startWorkoutLog: async (workoutDayId, completedDate = null) => {
    const response = await apiClient.post('/logs/start', {
      workoutDayId,
      completedDate: completedDate || new Date().toISOString()
    });
    return response.data;
  },

  /**
   * Get workout log by ID
   * @param {number} logId - Workout log ID
   * @returns {Promise<Object>} Workout log with exercise logs
   */
  getWorkoutLog: async (logId) => {
    const response = await apiClient.get(`/logs/${logId}`);
    return response.data;
  },

  /**
   * Log a single set for an exercise
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
   * Update an exercise log (set)
   * @param {number} setId - Exercise log ID
   * @param {Object} setData - Updated set data
   * @param {number} [setData.repsCompleted] - Reps completed
   * @param {number} [setData.weightKg] - Weight in kilograms
   * @param {string} [setData.notes] - Notes
   * @returns {Promise<Object>} Updated exercise log
   */
  updateSet: async (setId, setData) => {
    const response = await apiClient.put(`/logs/sets/${setId}`, setData);
    return response.data;
  },

  /**
   * Complete a workout log
   * @param {number} workoutLogId - Workout log ID
   * @param {string} [notes] - Optional notes about the workout
   * @returns {Promise<Object>} Completed workout log
   */
  completeWorkout: async (workoutLogId, notes = null) => {
    const response = await apiClient.put(`/logs/${workoutLogId}/complete`, { notes });
    return response.data;
  },

  /**
   * Delete a workout log
   * @param {number} workoutLogId - Workout log ID
   * @returns {Promise<Object>} Success message
   */
  deleteWorkoutLog: async (workoutLogId) => {
    const response = await apiClient.delete(`/logs/${workoutLogId}`);
    return response.data;
  },

  /**
   * Delete a single set log
   * @param {number} setId - Exercise log ID
   * @returns {Promise<Object>} Success message
   */
  deleteSet: async (setId) => {
    const response = await apiClient.delete(`/logs/sets/${setId}`);
    return response.data;
  },
};

export default workoutService;
