import axios from 'axios';

// Base API URL from environment variable or default to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor - can be used for authentication tokens in future
apiClient.interceptors.request.use(
  (config) => {
    // Log request in development mode
    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    // Log response in development mode
    if (import.meta.env.DEV) {
      console.log(`[API Response] ${response.config.url}`, response.data);
    }
    return response;
  },
  (error) => {
    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      console.error('[API Error]', {
        status: error.response.status,
        message: error.response.data?.message || error.message,
        url: error.config?.url,
      });

      // Handle specific status codes
      switch (error.response.status) {
        case 400:
          console.error('Bad Request:', error.response.data?.message);
          break;
        case 404:
          console.error('Resource Not Found:', error.response.data?.message);
          break;
        case 500:
          console.error('Server Error:', error.response.data?.message);
          break;
        default:
          console.error('API Error:', error.response.data?.message);
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('[API] No response received from server');
    } else {
      // Error in setting up request
      console.error('[API] Error setting up request:', error.message);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
