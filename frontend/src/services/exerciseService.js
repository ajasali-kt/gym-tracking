import apiClient from './api';

/**
 * Exercise Service
 * Handles all API calls related to exercises and muscle groups
 */

const exerciseService = {
  /**
   * Get all exercises
   * @returns {Promise<Array>} Array of exercises with muscle groups
   */
  getAllExercises: async () => {
    const response = await apiClient.get('/exercises');
    return response.data;
  },

  /**
   * Get single exercise by ID
   * @param {number} id - Exercise ID
   * @returns {Promise<Object>} Exercise object with details
   */
  getExerciseById: async (id) => {
    const response = await apiClient.get(`/exercises/${id}`);
    return response.data;
  },

  /**
   * Create new exercise
   * @param {Object} exerciseData - Exercise data
   * @param {string} exerciseData.name - Exercise name
   * @param {number} exerciseData.muscleGroupId - Muscle group ID
   * @param {string} exerciseData.description - Exercise description
   * @param {Array<string>} exerciseData.steps - Instruction steps
   * @param {string} [exerciseData.youtubeUrl] - Optional YouTube URL
   * @returns {Promise<Object>} Created exercise
   */
  createExercise: async (exerciseData) => {
    const response = await apiClient.post('/exercises', exerciseData);
    return response.data;
  },

  /**
   * Update existing exercise
   * @param {number} id - Exercise ID
   * @param {Object} exerciseData - Updated exercise data
   * @returns {Promise<Object>} Updated exercise
   */
  updateExercise: async (id, exerciseData) => {
    const response = await apiClient.put(`/exercises/${id}`, exerciseData);
    return response.data;
  },

  /**
   * Delete exercise
   * @param {number} id - Exercise ID
   * @returns {Promise<Object>} Success message
   */
  deleteExercise: async (id) => {
    const response = await apiClient.delete(`/exercises/${id}`);
    return response.data;
  },

  /**
   * Get all muscle groups
   * @returns {Promise<Array>} Array of muscle groups
   */
  getAllMuscleGroups: async () => {
    const response = await apiClient.get('/muscle-groups');
    return response.data;
  },

  /**
   * Get exercises by muscle group
   * @param {number} muscleGroupId - Muscle group ID
   * @returns {Promise<Array>} Filtered exercises
   */
  getExercisesByMuscleGroup: async (muscleGroupId) => {
    const response = await apiClient.get(`/muscle-groups/${muscleGroupId}/exercises`);
    return response.data;
  },

  /**
   * Search exercises by name
   * @param {string} searchTerm - Search term
   * @returns {Promise<Array>} Filtered exercises
   */
  searchExercises: async (searchTerm) => {
    const response = await apiClient.get('/exercises', {
      params: { search: searchTerm }
    });
    return response.data;
  },
};

export default exerciseService;
