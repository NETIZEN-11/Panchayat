import React, { useContext, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import api from '../config/api';

const STATUS_COLORS = {
  Pending: '#e74c3c', 'In Progress': '#f39c12', Resolved: '#27ae60', Rejected: '#95a5a6',
};

export default function SarpanchDashboardScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/analytics/village');
      setStats(res.data.data);
    } catch (err) {
      Alert.alert('Error', 'Could not load village stats');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => { setRefreshing(true); fetchStats(); };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#e67e22" />
        <Text style={styles.loadingText}>Loading village data...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>SARPANCH</Text>
        </View>
        <Text style={styles.headerTitle}>Village Admin Panel</Text>
        <Text style={styles.headerVillage}>{user?.village}</Text>
        <Text style={styles.headerName}>Namaste, {user?.name}</Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        <StatCard label="Total" value={stats?.total || 0} color="#3498db" />
        <StatCard label="Pending" value={stats?.pending || 0} color="#e74c3c" />
        <StatCard label="In Progress" value={stats?.inProgress || 0} color="#f39c12" />
        <StatCard label="Resolved" value={stats?.resolved || 0} color="#27ae60" />
        {(stats?.escalated > 0) && (
          <StatCard label="Escalated" value={stats?.escalated} color="#c0392b" fullWidth />
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>
        <View style={styles.actionsGrid}>
          <ActionBtn label="Village Complaints" color="#3498db" onPress={() => navigation.navigate('VillageComplaints')} />
          <ActionBtn label="Post Announcement" color="#9b59b6" onPress={() => navigation.navigate('Announcements')} />
          <ActionBtn label="Village Directory" color="#27ae60" onPress={() => navigation.navigate('Directory')} />
          <ActionBtn label="Manage Workers" color="#e67e22" onPress={() => navigation.navigate('Workers')} />
          <ActionBtn label="Escalated Issues" color="#e74c3c" onPress={() => navigation.navigate('VillageComplaints', { filter: 'escalated' })} />
        </View>
      </View>

      {/* Category Breakdown */}
      {stats?.byCategory?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>BY CATEGORY</Text>
          {stats.byCategory.map((item, i) => (
            <View key={i} style={styles.categoryRow}>
              <Text style={styles.categoryName}>{item._id}</Text>
              <View style={styles.categoryBarWrap}>
                <View style={[styles.categoryBar, { width: `${Math.min((item.count / (stats?.total || 1)) * 100, 100)}%` }]} />
              </View>
              <Text style={styles.categoryCount}>{item.count}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Recent Complaints */}
      {stats?.recent?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>RECENT COMPLAINTS</Text>
          {stats.recent.map((c, i) => (
            <TouchableOpacity
              key={i}
              style={styles.recentCard}
              onPress={() => navigation.navigate('AdminComplaintDetail', { id: c._id })}
            >
              <View style={styles.recentLeft}>
                <Text style={styles.recentTitle} numberOfLines={1}>{c.title}</Text>
                <Text style={styles.recentMeta}>{c.category} — {c.userId?.name}</Text>
              </View>
              <View style={[styles.statusTag, { backgroundColor: STATUS_COLORS[c.status] || '#95a5a6' }]}>
                <Text style={styles.statusTagText}>{c.status}</Text>
              </View>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.viewAllBtn} onPress={() => navigation.navigate('VillageComplaints')}>
            <Text style={[styles.viewAllText, { color: '#e67e22' }]}>View All Village Complaints</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const StatCard = ({ label, value, color, fullWidth }) => (
  <View style={[styles.statCard, { borderTopColor: color }, fullWidth && styles.statCardFull]}>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const ActionBtn = ({ label, color, onPress }) => (
  <TouchableOpacity style={[styles.actionBtn, { backgroundColor: color + '15', borderColor: color }]} onPress={onPress}>
    <View style={[styles.actionDot, { backgroundColor: color }]} />
    <Text style={[styles.actionBtnLabel, { color }]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#7f8c8d', fontSize: 15 },

  header: {
    backgroundColor: '#e67e22', padding: 25, paddingTop: 50, alignItems: 'center',
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
  },
  headerBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 5, marginBottom: 8,
  },
  headerBadgeText: { color: '#fff', fontWeight: 'bold', fontSize: 12, letterSpacing: 1.5 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  headerVillage: { fontSize: 16, color: 'rgba(255,255,255,0.9)', marginTop: 4 },
  headerName: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 2 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 15, gap: 10 },
  statCard: {
    width: '47%', backgroundColor: '#fff', borderRadius: 14, padding: 16,
    alignItems: 'center', borderTopWidth: 4, elevation: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 4,
  },
  statCardFull: { width: '100%' },
  statValue: { fontSize: 32, fontWeight: 'bold' },
  statLabel: { fontSize: 13, color: '#7f8c8d', fontWeight: '600', marginTop: 4 },

  section: {
    backgroundColor: '#fff', marginHorizontal: 15, marginTop: 15,
    borderRadius: 14, padding: 16, elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3,
  },
  sectionTitle: { fontSize: 11, fontWeight: '800', color: '#95a5a6', marginBottom: 14, letterSpacing: 1.5 },

  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  actionBtn: {
    width: '47%', borderRadius: 12, borderWidth: 2, padding: 14,
    flexDirection: 'row', alignItems: 'center',
  },
  actionDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  actionBtnLabel: { fontSize: 13, fontWeight: '700', flex: 1 },

  categoryRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  categoryName: { width: 110, fontSize: 13, color: '#2c3e50', fontWeight: '600' },
  categoryBarWrap: { flex: 1, height: 8, backgroundColor: '#f1f2f6', borderRadius: 4, marginHorizontal: 8, overflow: 'hidden' },
  categoryBar: { height: '100%', backgroundColor: '#e67e22', borderRadius: 4 },
  categoryCount: { width: 30, fontSize: 13, fontWeight: 'bold', color: '#e67e22', textAlign: 'right' },

  recentCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f2f6',
  },
  recentLeft: { flex: 1, marginRight: 10 },
  recentTitle: { fontSize: 14, fontWeight: '600', color: '#2c3e50' },
  recentMeta: { fontSize: 12, color: '#95a5a6', marginTop: 2 },
  statusTag: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  statusTagText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  viewAllBtn: { marginTop: 10, alignItems: 'center' },
  viewAllText: { fontSize: 14, fontWeight: '600' },
});
