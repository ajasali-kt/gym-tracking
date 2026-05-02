import apiClient from './api';

const bodyMeasurementService = {
  getMeasurements: async (filters = {}) => {
    const response = await apiClient.get('/body-measurements', { params: filters });
    return response.data;
  },

  saveMeasurement: async (payload) => {
    const response = await apiClient.post('/body-measurements', payload);
    return response.data;
  },

  updateMeasurement: async (id, payload) => {
    const response = await apiClient.put(`/body-measurements/${id}`, payload);
    return response.data;
  },

  deleteMeasurement: async (id) => {
    const response = await apiClient.delete(`/body-measurements/${id}`);
    return response.data;
  }
};

export default bodyMeasurementService;
