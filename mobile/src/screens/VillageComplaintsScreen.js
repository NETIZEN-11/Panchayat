import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, Alert, TextInput,
} from 'react-native';
import api from '../config/api';
import { ThemeContext } from '../context/ThemeContext';

const STATUSES = ['All', 'Pending', 'In Progress', 'Resolved', 'Rejected'];
const STATUS_COLORS = { Pending: '#e74c3c', 'In Progress': '#f39c12', Resolved: '#27ae60', Rejected: '#95a5a6' };
const PRIORITY_COLORS = { Low: '#95a5a6', Medium: '#f39c12', High: '#e74c3c', Urgent: '#c0392b' };

export default function VillageComplaintsScreen({ navigation, route }) {
  const { colors } = useContext(ThemeContext);
  const initFilter = route?.params?.filter;
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [status, setStatus] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => { fetchComplaints(); }, [status]);

  const fetchComplaints = async () => {
    try {
      const params = {};
      if (status !== 'All') params.status = status;
      if (initFilter === 'escalated') params.escalated = 'true';
      const res = await api.get('/complaints/village', { params });
      setComplaints(res.data.complaints || []);
    } catch { Alert.alert('Error', 'Could not load complaints'); }
    finally { setLoading(false); setRefreshing(false); }
  };

  const onRefresh = () => { setRefreshing(true); fetchComplaints(); };

  const filtered = complaints.filter(c =>
    c.title?.toLowerCase().includes(search.toLowerCase()) ||
    c.userId?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const renderComplaint = ({ item }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card }]}
      onPress={() => navigation.navigate('AdminComplaintDetail', { id: item._id })}
    >
      <View style={styles.cardTop}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
          <Text style={[styles.cardCategory, { color: colors.textSecondary }]}>{item.category}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] }]}>
          <Text style={styles.statusBadgeText}>{item.status}</Text>
        </View>
      </View>
      <Text style={[styles.cardDesc, { color: colors.textSecondary }]} numberOfLines={2}>{item.description}</Text>
      <View style={styles.cardMeta}>
        <Text style={[styles.metaText, { color: colors.textSecondary }]}>By: {item.userId?.name}</Text>
        <Text style={[styles.metaText, { color: colors.textSecondary }]}>Location: {item.location}</Text>
        <View style={[styles.priorityDot, { backgroundColor: PRIORITY_COLORS[item.priority] }]} />
        <Text style={[styles.priorityText, { color: PRIORITY_COLORS[item.priority] }]}>{item.priority}</Text>
      </View>
      {item.isEscalated && (
        <View style={styles.escalatedBadge}>
          <Text style={styles.escalatedText}>ESCALATED</Text>
        </View>
      )}
      <Text style={[styles.cardDate, { color: colors.textSecondary }]}>{new Date(item.createdAt).toLocaleDateString('en-IN')}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TextInput
        style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
        placeholder="Search complaints..."
        placeholderTextColor={colors.textSecondary}
        value={search}
        onChangeText={setSearch}
      />
      <View style={styles.filterRow}>
        {STATUSES.map(s => (
          <TouchableOpacity
            key={s}
            style={[styles.filterBtn, { borderColor: colors.border, backgroundColor: colors.surface }, status === s && styles.filterBtnActive]}
            onPress={() => setStatus(s)}
          >
            <Text style={[styles.filterBtnText, { color: colors.textSecondary }, status === s && styles.filterBtnTextActive]}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {loading ? (
        <View style={styles.centered}><ActivityIndicator size="large" color="#e67e22" /></View>
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderComplaint}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No complaints found</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBox: { margin: 12, borderRadius: 10, padding: 12, fontSize: 14, borderWidth: 1, elevation: 1 },
  filterRow: { flexDirection: 'row', paddingHorizontal: 12, gap: 6, marginBottom: 8, flexWrap: 'wrap' },
  filterBtn: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1 },
  filterBtnActive: { backgroundColor: '#e67e22', borderColor: '#e67e22' },
  filterBtnText: { fontSize: 12, fontWeight: '600' },
  filterBtnTextActive: { color: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 12 },
  card: { borderRadius: 14, padding: 14, marginBottom: 12, elevation: 2 },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  cardTitle: { fontSize: 15, fontWeight: '700' },
  cardCategory: { fontSize: 12, marginTop: 2 },
  statusBadge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  statusBadgeText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  cardDesc: { fontSize: 13, lineHeight: 18, marginBottom: 8 },
  cardMeta: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', alignItems: 'center' },
  metaText: { fontSize: 12 },
  priorityDot: { width: 8, height: 8, borderRadius: 4 },
  priorityText: { fontSize: 12, fontWeight: 'bold' },
  escalatedBadge: { backgroundColor: '#fff3cd', borderRadius: 6, padding: 4, marginTop: 6, alignSelf: 'flex-start', borderWidth: 1, borderColor: '#ffc107' },
  escalatedText: { fontSize: 10, fontWeight: 'bold', color: '#d35400', letterSpacing: 1 },
  cardDate: { fontSize: 11, marginTop: 6, textAlign: 'right' },
  empty: { alignItems: 'center', paddingTop: 40 },
  emptyText: { fontSize: 16 },
});
