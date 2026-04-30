import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../config/api';
import { registerForPushNotifications } from '../config/notifications';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        console.log('🔄 Checking saved session...');
        const savedToken = await AsyncStorage.getItem('token');
        const savedUser = await AsyncStorage.getItem('user');
        
        if (savedToken && savedUser) {
          console.log('✅ Found saved session');
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
          // Register for push notifications on app load
          registerForPushNotifications().catch(() => {});
        } else {
          console.log('❌ No saved session found');
        }
      } catch (e) {
        console.log('❌ Failed to restore session', e);
        // Clear corrupted data
        await AsyncStorage.multiRemove(['token', 'user']).catch(() => {});
      } finally {
        console.log('✅ Auth initialization complete');
        setLoading(false);
      }
    };
    
    // Add timeout to prevent infinite loading
    const timer = setTimeout(() => {
      console.log('⚠️ Auth timeout - forcing load complete');
      setLoading(false);
    }, 3000);
    
    bootstrapAsync().finally(() => clearTimeout(timer));
    
    return () => clearTimeout(timer);
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token: newToken, user: newUser } = response.data;
    await AsyncStorage.setItem('token', newToken);
    await AsyncStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    // Register for push notifications after login
    registerForPushNotifications().catch(() => {});
    return response.data;
  };

  const register = async (name, email, phone, password, village, role = 'citizen', district = 'General') => {
    const response = await api.post('/auth/register', {
      name, email, phone, password, village, role, district,
    });
    const { token: newToken, user: newUser } = response.data;
    await AsyncStorage.setItem('token', newToken);
    await AsyncStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    registerForPushNotifications().catch(() => {});
    return response.data;
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const isCitizen = () => ['citizen', 'user'].includes(user?.role);
  const isSarpanch = () => ['sarpanch', 'admin'].includes(user?.role);
  const isGovt = () => user?.role === 'govt';

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isCitizen, isSarpanch, isGovt }}>
      {children}
    </AuthContext.Provider>
  );
}
