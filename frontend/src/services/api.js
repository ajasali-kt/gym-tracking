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
  withCredentials: true, // Enable sending cookies with requests
});

// Request interceptor - add JWT token to requests
apiClient.interceptors.request.use(
  (config) => {
    // Add JWT token to Authorization header
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

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

// Track if we're currently refreshing to avoid multiple refresh calls
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Response interceptor - handle errors globally and refresh tokens
apiClient.interceptors.response.use(
  (response) => {
    // Log response in development mode
    if (import.meta.env.DEV) {
      console.log(`[API Response] ${response.config.url}`, response.data);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      console.error('[API Error]', {
        status: error.response.status,
        message: error.response.data?.message || error.message,
        url: error.config?.url,
      });

      // Handle 401 Unauthorized - attempt token refresh
      // Skip token refresh for login and register endpoints
      const isAuthEndpoint = originalRequest.url?.includes('/auth/login') ||
                             originalRequest.url?.includes('/auth/register');

      if (error.response.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
        if (isRefreshing) {
          // If already refreshing, queue this request
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return apiClient(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = localStorage.getItem('refreshToken');

        if (!refreshToken) {
          // No refresh token available, redirect to login
          window.location.href = '/login';
          return Promise.reject(error);
        }

        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const { tokens } = response.data;
          const newAccessToken = tokens.accessToken;

          // Update access token
          localStorage.setItem('accessToken', newAccessToken);

          // Update authorization header
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          // Process queued requests
          processQueue(null, newAccessToken);

          // Retry original request
          return apiClient(originalRequest);
        } catch (refreshError) {
          // Refresh failed, clear tokens and redirect to login
          processQueue(refreshError, null);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

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
