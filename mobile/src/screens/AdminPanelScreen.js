import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, ScrollView,
} from 'react-native';
import api from '../config/api';

const AdminPanelScreen = ({ navigation }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/analytics/overview');
      setStats(res.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => { setRefreshing(true); fetchStats(); };
  const total = stats?.total || 0;
  const resolved = stats?.resolved || 0;
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: '#3498db' }]}>
          <Text style={styles.statNumber}>{stats?.total || 0}</Text>
          <Text style={styles.statLabel}>Total Complaints</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#f39c12' }]}>
          <Text style={styles.statNumber}>{stats?.pending || 0}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#9b59b6' }]}>
          <Text style={styles.statNumber}>{stats?.inProgress || 0}</Text>
          <Text style={styles.statLabel}>In Progress</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#27ae60' }]}>
          <Text style={styles.statNumber}>{stats?.resolved || 0}</Text>
          <Text style={styles.statLabel}>Resolved</Text>
        </View>

        <View style={[styles.statCard, styles.fullWidth, { backgroundColor: '#e74c3c' }]}>
          <Text style={styles.statNumber}>{resolutionRate}%</Text>
          <Text style={styles.statLabel}>Resolution Rate</Text>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('VillageComplaints')}>
          <Text style={styles.actionText}>Manage Complaints</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Schemes')}>
          <Text style={styles.actionText}>Manage Schemes</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Polls')}>
          <Text style={styles.actionText}>Polls</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Announcements')}>
          <Text style={styles.actionText}>Announcements</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Directory')}>
          <Text style={styles.actionText}>Directory</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: '#e74c3c', padding: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  statsContainer: { flexDirection: 'row', flexWrap: 'wrap', padding: 15 },
  statCard: {
    width: '48%', padding: 20, borderRadius: 10, marginBottom: 15, marginRight: '2%', elevation: 3,
  },
  fullWidth: { width: '98%' },
  statNumber: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginBottom: 5 },
  statLabel: { fontSize: 14, color: '#fff' },
  actionsContainer: { padding: 15 },
  actionButton: {
    backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center',
    padding: 15, borderRadius: 10, marginBottom: 10, elevation: 2,
  },
  actionText: { fontSize: 16, color: '#2c3e50', fontWeight: '500' },
});

export default AdminPanelScreen;
