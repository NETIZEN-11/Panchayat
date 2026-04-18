import React, { useContext, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import api from '../config/api';

export default function GovtDashboardScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { fetchOverview(); }, []);

  const fetchOverview = async () => {
    try {
      const res = await api.get('/analytics/overview');
      setOverview(res.data.data);
    } catch (err) {
      Alert.alert('Error', 'Could not load ministry data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => { setRefreshing(true); fetchOverview(); };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#8e44ad" />
        <Text style={styles.loadingText}>Loading ministry data...</Text>
      </View>
    );
  }

  const resolutionRate = overview?.total > 0
    ? Math.round((overview.resolved / overview.total) * 100) : 0;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>GOVT OFFICER</Text>
        </View>
        <Text style={styles.headerTitle}>Government Command Center</Text>
        <Text style={styles.headerSub}>Ministry Level — All India View</Text>
        <Text style={styles.headerName}>{user?.name}</Text>
      </View>

      {/* Key Metrics */}
      <View style={styles.metricsRow}>
        <MetricCard label="Total" value={overview?.total || 0} color="#3498db" />
        <MetricCard label="Pending" value={overview?.pending || 0} color="#e74c3c" />
        <MetricCard label="Progress" value={overview?.inProgress || 0} color="#f39c12" />
        <MetricCard label="Resolved" value={overview?.resolved || 0} color="#27ae60" />
      </View>

      {/* Alert Cards */}
      <View style={styles.alertRow}>
        {(overview?.escalated > 0) && (
          <TouchableOpacity
            style={[styles.alertCard, { backgroundColor: '#fff3cd', borderColor: '#ffc107' }]}
            onPress={() => navigation.navigate('AllComplaints', { escalated: 'true' })}
          >
            <View style={[styles.alertDot, { backgroundColor: '#ffc107' }]} />
            <Text style={styles.alertValue}>{overview.escalated}</Text>
            <Text style={styles.alertLabel}>Escalated</Text>
          </TouchableOpacity>
        )}
        {(overview?.urgent > 0) && (
          <TouchableOpacity
            style={[styles.alertCard, { backgroundColor: '#fde8e8', borderColor: '#e74c3c' }]}
            onPress={() => navigation.navigate('AllComplaints', { priority: 'Urgent' })}
          >
            <View style={[styles.alertDot, { backgroundColor: '#e74c3c' }]} />
            <Text style={[styles.alertValue, { color: '#e74c3c' }]}>{overview.urgent}</Text>
            <Text style={[styles.alertLabel, { color: '#e74c3c' }]}>Urgent</Text>
          </TouchableOpacity>
        )}
        <View style={[styles.alertCard, { backgroundColor: '#e8f8f5', borderColor: '#27ae60' }]}>
          <View style={[styles.alertDot, { backgroundColor: '#27ae60' }]} />
          <Text style={[styles.alertValue, { color: '#27ae60' }]}>{resolutionRate}%</Text>
          <Text style={[styles.alertLabel, { color: '#27ae60' }]}>Resolved</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>
        <View style={styles.actionsGrid}>
          <ActionBtn label="All Complaints" color="#3498db" onPress={() => navigation.navigate('AllComplaints')} />
          <ActionBtn label="Escalated Cases" color="#e74c3c" onPress={() => navigation.navigate('AllComplaints', { escalated: 'true' })} />
          <ActionBtn label="Manage Schemes" color="#27ae60" onPress={() => navigation.navigate('Schemes')} />
          <ActionBtn label="Announcements" color="#9b59b6" onPress={() => navigation.navigate('Announcements')} />
        </View>
      </View>

      {/* Top Villages */}
      {overview?.byVillage?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>VILLAGES — COMPLAINT LOAD (TOP 10)</Text>
          {overview.byVillage.map((v, i) => (
            <TouchableOpacity
              key={i}
              style={styles.villageRow}
              onPress={() => navigation.navigate('AllComplaints', { village: v._id })}
            >
              <Text style={styles.villageRank}>{i + 1}.</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.villageName}>{v._id}</Text>
                <View style={styles.villageBarWrap}>
                  <View style={[styles.villageBar, { width: `${Math.min((v.total / (overview?.byVillage[0]?.total || 1)) * 100, 100)}%` }]} />
                </View>
              </View>
              <View style={styles.villageStats}>
                <Text style={styles.villageTotal}>{v.total}</Text>
                <Text style={[styles.villagePending, v.pending > 0 && styles.villagePendingAlert]}>
                  {v.pending > 0 ? `${v.pending} pending` : 'Clear'}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Category Breakdown */}
      {overview?.byCategory?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>BY CATEGORY</Text>
          {overview.byCategory.map((c, i) => (
            <TouchableOpacity key={i} style={styles.catRow} onPress={() => navigation.navigate('AllComplaints', { category: c._id })}>
              <Text style={styles.catName}>{c._id}</Text>
              <View style={styles.catBarWrap}>
                <View style={[styles.catBar, { width: `${Math.min((c.count / (overview?.total || 1)) * 100, 100)}%` }]} />
              </View>
              <Text style={styles.catCount}>{c.count}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* District Breakdown */}
      {overview?.byDistrict?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>BY DISTRICT</Text>
          {overview.byDistrict.map((d, i) => (
            <TouchableOpacity key={i} style={styles.catRow} onPress={() => navigation.navigate('AllComplaints', { district: d._id })}>
              <Text style={styles.catName}>{d._id || 'Unknown'}</Text>
              <View style={styles.catBarWrap}>
                <View style={[styles.catBar, { backgroundColor: '#8e44ad', width: `${Math.min((d.count / (overview?.total || 1)) * 100, 100)}%` }]} />
              </View>
              <Text style={styles.catCount}>{d.count}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const MetricCard = ({ label, value, color }) => (
  <View style={[styles.metricCard, { borderTopColor: color }]}>
    <Text style={[styles.metricValue, { color }]}>{value}</Text>
    <Text style={styles.metricLabel}>{label}</Text>
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
    backgroundColor: '#8e44ad', padding: 25, paddingTop: 50, alignItems: 'center',
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
  },
  headerBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 5, marginBottom: 8,
  },
  headerBadgeText: { color: '#fff', fontWeight: 'bold', fontSize: 11, letterSpacing: 1.5 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', textAlign: 'center' },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 3 },
  headerName: { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 2 },

  metricsRow: { flexDirection: 'row', padding: 15, gap: 8 },
  metricCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 12,
    alignItems: 'center', borderTopWidth: 4, elevation: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 3,
  },
  metricValue: { fontSize: 22, fontWeight: 'bold' },
  metricLabel: { fontSize: 11, color: '#7f8c8d', fontWeight: '600', marginTop: 2, textAlign: 'center' },

  alertRow: { flexDirection: 'row', paddingHorizontal: 15, gap: 10, marginBottom: 5 },
  alertCard: { flex: 1, borderRadius: 12, borderWidth: 2, padding: 12, alignItems: 'center' },
  alertDot: { width: 12, height: 12, borderRadius: 6, marginBottom: 4 },
  alertValue: { fontSize: 20, fontWeight: 'bold', color: '#2c3e50' },
  alertLabel: { fontSize: 11, fontWeight: '600', color: '#636e72', marginTop: 1 },

  section: {
    backgroundColor: '#fff', marginHorizontal: 15, marginTop: 15,
    borderRadius: 14, padding: 16, elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3,
  },
  sectionTitle: { fontSize: 11, fontWeight: '800', color: '#95a5a6', marginBottom: 14, letterSpacing: 1.5 },

  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  actionBtn: { width: '47%', borderRadius: 12, borderWidth: 2, padding: 14, flexDirection: 'row', alignItems: 'center' },
  actionDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  actionBtnLabel: { fontSize: 12, fontWeight: '700', flex: 1 },

  villageRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f1f2f6' },
  villageRank: { width: 24, fontSize: 13, fontWeight: 'bold', color: '#95a5a6' },
  villageName: { fontSize: 14, fontWeight: '700', color: '#2c3e50', marginBottom: 4 },
  villageBarWrap: { height: 6, backgroundColor: '#f1f2f6', borderRadius: 3, overflow: 'hidden' },
  villageBar: { height: '100%', backgroundColor: '#8e44ad', borderRadius: 3 },
  villageStats: { marginLeft: 10, alignItems: 'flex-end' },
  villageTotal: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50' },
  villagePending: { fontSize: 11, color: '#27ae60' },
  villagePendingAlert: { color: '#e74c3c' },

  catRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  catName: { width: 110, fontSize: 13, color: '#2c3e50', fontWeight: '600' },
  catBarWrap: { flex: 1, height: 8, backgroundColor: '#f1f2f6', borderRadius: 4, marginHorizontal: 8, overflow: 'hidden' },
  catBar: { height: '100%', backgroundColor: '#3498db', borderRadius: 4 },
  catCount: { width: 30, fontSize: 13, fontWeight: 'bold', color: '#3498db', textAlign: 'right' },
});
