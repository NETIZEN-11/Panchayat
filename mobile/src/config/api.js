import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LogBox } from 'react-native';

LogBox.ignoreLogs(['Non-serializable values were found in the navigation state']);

// ─────────────────────────────────────────────────────────────
//  BACKEND URL CONFIGURATION
//  After deploying to Render, paste your URL below and set
//  IS_PRODUCTION = true
// ─────────────────────────────────────────────────────────────
const IS_PRODUCTION = false; // ← Development mode ON

const PRODUCTION_URL = 'https://panchayat-t1ui.onrender.com'; // ← Render URL
const DEV_URL        = 'http://localhost:5000';                // ← Local backend server

export const BACKEND_URL = IS_PRODUCTION ? PRODUCTION_URL : DEV_URL;

// ─────────────────────────────────────────────────────────────

const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch {}
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle global response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      error.message = 'Connection timeout. Please check your network.';
    }
    if (error.response?.status === 401) {
      // Auto-clear stale session
      AsyncStorage.multiRemove(['token', 'user']).catch(() => {});
    }
    return Promise.reject(error);
  }
);

// Returns the full base URL (used by SocketContext)
export const getApiBaseUrl = () => api.defaults.baseURL;

// Returns base URL without /api (used for image URLs)
export const getImageBaseUrl = () => BACKEND_URL;

export default api;
