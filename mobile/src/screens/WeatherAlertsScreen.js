import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import api from '../config/api';
import { ThemeContext } from '../context/ThemeContext';

const WeatherAlertsScreen = () => {
  const { colors } = useContext(ThemeContext);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { fetchWeather(); }, []);

  const fetchWeather = async () => {
    try {
      // Mock weather data - in production, integrate with OpenWeatherMap API
      const mockWeather = {
        current: {
          temp: 32,
          condition: 'Partly Cloudy',
          humidity: 65,
          windSpeed: 12,
          icon: '⛅'
        },
        alerts: [
          { type: 'heat', severity: 'medium', message: 'Heat wave expected tomorrow. Stay hydrated.', day: 'Tomorrow' },
          { type: 'rain', severity: 'low', message: 'Light rain expected in the evening.', day: 'In 2 days' },
        ],
        forecast: [
          { day: 'Today', high: 35, low: 26, icon: '⛅', condition: 'Partly Cloudy' },
          { day: 'Tomorrow', high: 37, low: 27, icon: '🌤️', condition: 'Sunny' },
          { day: 'Day 3', high: 33, low: 25, icon: '🌧️', condition: 'Rain' },
          { day: 'Day 4', high: 31, low: 24, icon: '⛈️', condition: 'Thunderstorm' },
          { day: 'Day 5', high: 30, low: 23, icon: '🌤️', condition: 'Cloudy' },
        ]
      };
      setWeather(mockWeather);
    } catch { setWeather(null); }
    finally { setLoading(false); setRefreshing(false); }
  };

  const onRefresh = () => { setRefreshing(true); fetchWeather(); };

  const getAlertSeverityColor = (severity) => {
    const severityColors = { low: '#27ae60', medium: '#f39c12', high: '#e67e22', critical: '#e74c3c' };
    return severityColors[severity] || '#95a5a6';
  };

  if (loading) {
    return <View style={[styles.centered, { backgroundColor: colors.background }]}><ActivityIndicator size="large" color="#3498db" /></View>;
  }

  if (!weather) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.empty}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Weather data unavailable</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={[1]}
        renderItem={() => (
          <>
            <View style={[styles.currentWeather, { backgroundColor: colors.card }]}>
              <Text style={styles.weatherIcon}>{weather.current.icon}</Text>
              <Text style={[styles.temperature, { color: colors.text }]}>{weather.current.temp}°C</Text>
              <Text style={[styles.condition, { color: colors.textSecondary }]}>{weather.current.condition}</Text>
              <View style={styles.weatherDetails}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailIcon}>💧</Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>{weather.current.humidity}%</Text>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Humidity</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailIcon}>💨</Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>{weather.current.windSpeed} km/h</Text>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Wind</Text>
                </View>
              </View>
            </View>

            {weather.alerts && weather.alerts.length > 0 && (
              <View style={styles.alertsSection}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>⚠️ Weather Alerts</Text>
                {weather.alerts.map((alert, index) => (
                  <View key={index} style={[styles.alertCard, { backgroundColor: colors.card, borderLeftColor: getAlertSeverityColor(alert.severity) }]}>
                    <View style={styles.alertHeader}>
                      <Text style={[styles.alertType, { color: colors.text }]}>{alert.type?.toUpperCase()}</Text>
                      <View style={[styles.severityBadge, { backgroundColor: getAlertSeverityColor(alert.severity) }]}>
                        <Text style={styles.severityText}>{alert.severity?.toUpperCase()}</Text>
                      </View>
                    </View>
                    <Text style={[styles.alertMessage, { color: colors.textSecondary }]}>{alert.message}</Text>
                    <Text style={[styles.alertDay, { color: colors.textSecondary }]}>Expected: {alert.day}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.forecastSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>📅 5-Day Forecast</Text>
              <View style={styles.forecastGrid}>
                {weather.forecast.map((day, index) => (
                  <View key={index} style={[styles.forecastCard, { backgroundColor: colors.card }]}>
                    <Text style={[styles.forecastDay, { color: colors.text }]}>{day.day}</Text>
                    <Text style={styles.forecastIcon}>{day.icon}</Text>
                    <Text style={[styles.forecastHigh, { color: colors.text }]}>{day.high}°</Text>
                    <Text style={[styles.forecastLow, { color: colors.textSecondary }]}>{day.low}°</Text>
                    <Text style={[styles.forecastCondition, { color: colors.textSecondary }]} numberOfLines={1}>{day.condition}</Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        )}
        keyExtractor={() => 'weather'}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 15 },
  currentWeather: { padding: 25, borderRadius: 15, alignItems: 'center', marginBottom: 20 },
  weatherIcon: { fontSize: 60, marginBottom: 10 },
  temperature: { fontSize: 48, fontWeight: 'bold' },
  condition: { fontSize: 16, marginBottom: 15 },
  weatherDetails: { flexDirection: 'row', gap: 40, marginTop: 10 },
  detailItem: { alignItems: 'center' },
  detailIcon: { fontSize: 20, marginBottom: 4 },
  detailValue: { fontSize: 16, fontWeight: 'bold' },
  detailLabel: { fontSize: 12 },
  alertsSection: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  alertCard: { padding: 15, borderRadius: 10, marginBottom: 10, borderLeftWidth: 4 },
  alertHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  alertType: { fontSize: 14, fontWeight: 'bold' },
  severityBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  severityText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  alertMessage: { fontSize: 13, marginBottom: 5 },
  alertDay: { fontSize: 11 },
  forecastSection: { marginBottom: 20 },
  forecastGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  forecastCard: { flex: 1, alignItems: 'center', padding: 10, marginHorizontal: 3, borderRadius: 10 },
  forecastDay: { fontSize: 12, fontWeight: 'bold', marginBottom: 5 },
  forecastIcon: { fontSize: 24, marginBottom: 5 },
  forecastHigh: { fontSize: 14, fontWeight: 'bold' },
  forecastLow: { fontSize: 12 },
  forecastCondition: { fontSize: 10, marginTop: 2 },
  empty: { alignItems: 'center', marginTop: 50 },
  emptyText: { fontSize: 16 },
});

export default WeatherAlertsScreen;