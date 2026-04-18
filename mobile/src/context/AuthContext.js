import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../config/api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const savedToken = await AsyncStorage.getItem('token');
        const savedUser = await AsyncStorage.getItem('user');
        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
        }
      } catch (e) {
        console.log('Failed to restore session', e);
      } finally {
        setLoading(false);
      }
    };
    const timer = setTimeout(bootstrapAsync, 100);
    return () => clearTimeout(timer);
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token: newToken, user: newUser } = response.data;
    await AsyncStorage.setItem('token', newToken);
    await AsyncStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
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
    return response.data;
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  // Helper role checkers
  const isCitizen = () => ['citizen', 'user'].includes(user?.role);
  const isSarpanch = () => ['sarpanch', 'admin'].includes(user?.role);
  const isGovt = () => user?.role === 'govt';

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isCitizen, isSarpanch, isGovt }}>
      {children}
    </AuthContext.Provider>
  );
}