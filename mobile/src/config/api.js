import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, LogBox } from 'react-native';

// Ignore specific warnings
LogBox.ignoreLogs(['Non-serializable values were found in the navigation state']);

// YOUR MACHINE'S LAN IP — update this if your WiFi IP changes
// Run `ipconfig` on Windows to find your IPv4 address
const MACHINE_IP = '10.110.158.175';

const getBaseUrl = () => {
  // This IP works for physical devices (Expo Go) AND emulators on the same network.
  // For Android emulator ONLY you may also use 10.0.2.2 — but LAN IP works universally.
  return `http://${MACHINE_IP}:5000/api`;
};

let API_BASE_URL = getBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased timeout
  headers: {
    'Content-Type': 'application/json',
  },
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
    console.log('Current baseURL:', api.defaults.baseURL);

    if (error.code === 'ECONNABORTED') {
      error.message = 'Connection timeout. Please check your network.';
    }

    if (error.response?.status === 401) {
      // Token expired or invalid - clear storage
      AsyncStorage.removeItem('token').catch(() => {});
      AsyncStorage.removeItem('user').catch(() => {});
    }
    return Promise.reject(error);
  }
);

// Helper to set custom API URL (for physical device testing)
export const setApiBaseUrl = async (ip) => {
  if (ip) {
    const newUrl = `http://${ip}:5000/api`;
    api.defaults.baseURL = newUrl;
    API_BASE_URL = newUrl;
    await AsyncStorage.setItem('apiIp', ip);
    console.log('API URL updated to:', newUrl);
  }
};

// Get stored custom API URL on app start
export const initApiUrl = async () => {
  try {
    const storedIp = await AsyncStorage.getItem('apiIp');
    if (storedIp) {
      api.defaults.baseURL = `http://${storedIp}:5000/api`;
      API_BASE_URL = `http://${storedIp}:5000/api`;
      console.log('Using stored API URL:', API_BASE_URL);
    }
  } catch (error) {
    console.log('Error initializing API URL:', error);
  }
};

export const getApiBaseUrl = () => API_BASE_URL;

// Get base URL for images (strip /api)
export const getImageBaseUrl = () => {
  return API_BASE_URL.replace('/api', '');
};

export default api;