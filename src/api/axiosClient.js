import axios from 'axios';
import { STORAGE_KEYS } from '../constants/auth';
import { clearAllSessionData } from '../utils/sessionSecurity';

// Create an axios instance with default config

const baseURL = import.meta.env.VITE_API_URL; // Access it here
const axiosClient = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach the JWT token to every request
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors (expired token)
    if (error.response && error.response.status === 401) {
      // List of endpoints that should not trigger automatic redirect
      const publicEndpoints = [
        '/auth/login',
        '/auth/register',
        '/auth/forgot-password',
        '/auth/forgot-password-otp',
        '/auth/verify-password-reset-otp',
        '/auth/reset-password',
        '/auth/reset-password-otp',
        '/users/check-username',
        '/users/verify-activation-token',
        '/users/activate-account'
      ];
      
      // Check if the failed request was to a public endpoint
      const requestUrl = error.config?.url || '';
      const isPublicEndpoint = publicEndpoints.some(endpoint => requestUrl.includes(endpoint));
      
      // Only redirect if it's not a public endpoint
      if (!isPublicEndpoint) {
        // SECURITY FIX: Clear all session data using centralized utility
        clearAllSessionData();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
