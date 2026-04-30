import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import * as Updates from 'expo-updates';
import { AuthProvider } from './src/context/AuthContext';
import { LanguageProvider } from './src/context/LanguageContext';
import { ThemeProvider } from './src/context/ThemeContext';
import { SchemeProvider } from './src/context/SchemeContext';
import { ComplaintProvider } from './src/context/ComplaintContext';
import { SocketProvider } from './src/context/SocketContext';
import AppNavigator from './src/navigation/Navigation';

export default function App() {
  useEffect(() => {
    // Disable automatic updates to prevent IOException
    if (__DEV__) {
      console.log('Development mode - Updates disabled');
    }
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <AuthProvider>
        <LanguageProvider>
          <ThemeProvider>
            <SchemeProvider>
              <ComplaintProvider>
                <SocketProvider>
                  <AppNavigator />
                </SocketProvider>
              </ComplaintProvider>
            </SchemeProvider>
          </ThemeProvider>
        </LanguageProvider>
      </AuthProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});