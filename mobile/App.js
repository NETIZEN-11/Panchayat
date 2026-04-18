import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { AuthProvider } from './src/context/AuthContext';
import { LanguageProvider } from './src/context/LanguageContext';
import { SchemeProvider } from './src/context/SchemeContext';
import { ComplaintProvider } from './src/context/ComplaintContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <AuthProvider>
        <LanguageProvider>
          <SchemeProvider>
            <ComplaintProvider>
              <AppNavigator />
            </ComplaintProvider>
          </SchemeProvider>
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