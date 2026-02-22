import apiClient from './api';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

/**
 * Create a shareable link for workout history
 * @param {string} fromDate - Start date (YYYY-MM-DD)
 * @param {string} toDate - End date (YYYY-MM-DD)
 * @param {number|null} expiresInDays - Days until expiration (null = never)
 * @returns {Promise<Object>} Share link data
 */
export const createShareLink = async (fromDate, toDate, expiresInDays = null) => {
  const response = await apiClient.post('/share', {
    fromDate,
    toDate,
    expiresInDays
  });
  return response.data;
};

/**
 * Get shared workout history (public, no auth required)
 * @param {string} token - Share token (UUID)
 * @returns {Promise<Object>} Shared workout history
 */
export const getSharedHistory = async (token) => {
  // Use axios directly (not apiClient) to bypass auth interceptor
  const response = await axios.get(`${API_BASE_URL}/share/${token}`);
  return response.data;
};

/**
 * Get all shares (admin only)
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} List of shares
 */
export const getAllShares = async (filters = {}) => {
  const params = {};

  if (filters.userId) {
    params.userId = filters.userId;
  }

  if (filters.isActive === 'true' || filters.isActive === 'false') {
    params.isActive = filters.isActive;
  }

  if (typeof filters.search === 'string' && filters.search.trim()) {
    params.search = filters.search.trim();
  }

  const response = await apiClient.get('/admin/shares', { params });
  return response.data;
};

/**
 * Revoke a share link (admin only)
 * @param {string} token - Share token
 * @returns {Promise<Object>} Updated share
 */
export const revokeShare = async (token) => {
  const response = await apiClient.put(`/admin/share/${token}/revoke`);
  return response.data;
};

/**
 * Activate a share link (admin only)
 * @param {string} token - Share token
 * @returns {Promise<Object>} Updated share
 */
export const activateShare = async (token) => {
  const response = await apiClient.put(`/admin/share/${token}/activate`);
  return response.data;
};

/**
 * Delete a share link (admin only)
 * @param {string} token - Share token
 * @returns {Promise<Object>} Deleted share
 */
export const deleteShare = async (token) => {
  const response = await apiClient.delete(`/admin/share/${token}`);
  return response.data;
};

export default {
  createShareLink,
  getSharedHistory,
  getAllShares,
  revokeShare,
  activateShare,
  deleteShare
};
