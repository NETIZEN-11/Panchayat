import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, LogBox } from 'react-native';

// Ignore specific warnings
LogBox.ignoreLogs(['Non-serializable values were found in the navigation state']);

// Dynamic API URL - reads from AsyncStorage on init, falls back to auto-detected value
const getStoredOrDefaultIP = async () => {
  try {
    const storedIp = await AsyncStorage.getItem('apiIp');
    if (storedIp) return storedIp;
  } catch (e) {}
  return null;
};

// ─── Production URL (Render deployment) ───────────────────────
// Replace this with your actual Render URL after deploying the backend
const PRODUCTION_URL = 'https://your-app-name.onrender.com/api';

// Local dev fallback (your machine IP for testing on physical device)
const MACHINE_IP = '10.110.158.175';
const DEV_URL = `http://${MACHINE_IP}:5000/api`;

const IS_PRODUCTION = true; // Set to false for local development

const api = axios.create({
  baseURL: IS_PRODUCTION ? PRODUCTION_URL : DEV_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Initialize URL from storage on module load (best effort, non-blocking)
getStoredOrDefaultIP().then((storedIp) => {
  if (!IS_PRODUCTION && storedIp) {
    api.defaults.baseURL = `http://${storedIp}:5000/api`;
  }
});

// Add token to requests
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.log('Error getting token:', error);
    }
    return config;
  },
  (error) => {
    console.log('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Handle responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('API Response Error:', error.message);

    if (error.code === 'ECONNABORTED') {
      error.message = 'Connection timeout. Please check your network.';
    }

    if (error.response?.status === 401) {
      AsyncStorage.removeItem('token').catch(() => {});
      AsyncStorage.removeItem('user').catch(() => {});
    }
    return Promise.reject(error);
  }
);

// Update API URL at runtime (for switching between emulator/physical device)
export const setApiBaseUrl = async (ip) => {
  if (ip) {
    const newUrl = `http://${ip}:5000/api`;
    api.defaults.baseURL = newUrl;
    await AsyncStorage.setItem('apiIp', ip);
    console.log('API URL updated to:', newUrl);
  }
};

// Public getter for current base URL
export const getApiBaseUrl = () => api.defaults.baseURL;

// Strip /api for image base URL
export const getImageBaseUrl = () => {
  return api.defaults.baseURL.replace('/api', '');
};

export default api;
