import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LogBox, Platform } from 'react-native';

LogBox.ignoreLogs(['Non-serializable values were found in the navigation state']);

// ─────────────────────────────────────────────────────────────
//  BACKEND URL — single source of truth
//  Update this URL whenever your backend deployment changes.
// ─────────────────────────────────────────────────────────────
// For local development: choose a host that works for your environment.
// - On Android emulators use `10.0.2.2` (maps to host localhost)
// - On iOS simulators or running on the same machine use `localhost`
export const BACKEND_URL = __DEV__
  ? (Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000')
  : 'https://panchayat-t1ui.onrender.com';
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
    console.error('API Error:', error);
    
    if (error.code === 'ECONNABORTED') {
      error.message = 'Connection timeout. Please check your network.';
    } else if (error.code === 'ECONNREFUSED') {
      error.message = 'Cannot connect to server. Please check if the backend is running.';
    } else if (error.code === 'NETWORK_ERROR') {
      error.message = 'Network error. Please check your internet connection.';
    } else if (!error.response) {
      error.message = 'Network error. Please check your connection and try again.';
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
