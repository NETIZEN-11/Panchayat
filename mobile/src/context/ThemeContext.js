import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const saved = await AsyncStorage.getItem('theme');
        if (saved === 'dark') setIsDark(true);
      } catch {}
    };
    load();
  }, []);

  const toggleTheme = async () => {
    const next = !isDark;
    setIsDark(next);
    await AsyncStorage.setItem('theme', next ? 'dark' : 'light');
  };

  const colors = isDark ? {
    background: '#1a1a2e', surface: '#16213e', card: '#0f3460',
    text: '#eaeaea', textSecondary: '#a0a0a0', primary: '#3498db',
    success: '#27ae60', warning: '#f39c12', danger: '#e74c3c',
    border: '#2c3e50', inputBg: '#1a1a2e', tabBar: '#16213e',
  } : {
    background: '#f5f5f5', surface: '#ffffff', card: '#ffffff',
    text: '#2c3e50', textSecondary: '#7f8c8d', primary: '#3498db',
    success: '#27ae60', warning: '#f39c12', danger: '#e74c3c',
    border: '#ecf0f1', inputBg: '#f8f9fa', tabBar: '#ffffff',
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};
