import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { AuthProvider } from './src/context/AuthContext';
import { LanguageProvider } from './src/context/LanguageContext';
import { ThemeProvider } from './src/context/ThemeContext';
import { SchemeProvider } from './src/context/SchemeContext';
import { ComplaintProvider } from './src/context/ComplaintContext';
import { SocketProvider } from './src/context/SocketContext';
import AppNavigator from './src/navigation/Navigation';
import ErrorBoundary from './src/components/ErrorBoundary';

export default function App() {

  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});