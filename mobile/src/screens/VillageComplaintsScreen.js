import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, Alert, TextInput,
} from 'react-native';
import api from '../config/api';

const STATUSES = ['All', 'Pending', 'In Progress', 'Resolved', 'Rejected'];
const STATUS_COLORS = {
  Pending: '#e74c3c', 'In Progress': '#f39c12', Resolved: '#27ae60', Rejected: '#95a5a6',
};
const PRIORITY_COLORS = { Low: '#95a5a6', Medium: '#f39c12', High: '#e74c3c', Urgent: '#c0392b' };

export default function VillageComplaintsScreen({ navigation, route }) {
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
    } catch (err) {
      Alert.alert('Error', 'Could not load complaints');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => { setRefreshing(true); fetchComplaints(); };

  const filtered = complaints.filter(c =>
    c.title?.toLowerCase().includes(search.toLowerCase()) ||
    c.userId?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const renderComplaint = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('AdminComplaintDetail', { id: item._id })}
    >
      <View style={styles.cardTop}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.cardCategory}>{item.category}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] }]}>
          <Text style={styles.statusBadgeText}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
      <View style={styles.cardMeta}>
        <Text style={styles.metaText}>By: {item.userId?.name}</Text>
        <Text style={styles.metaText}>Location: {item.location}</Text>
        <View style={[styles.priorityDot, { backgroundColor: PRIORITY_COLORS[item.priority] }]} />
        <Text style={[styles.priorityText, { color: PRIORITY_COLORS[item.priority] }]}>{item.priority}</Text>
      </View>
      {item.isEscalated && (
        <View style={styles.escalatedBadge}>
          <Text style={styles.escalatedText}>ESCALATED</Text>
        </View>
      )}
      <Text style={styles.cardDate}>{new Date(item.createdAt).toLocaleDateString('en-IN')}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBox}
        placeholder="Search complaints..."
        value={search}
        onChangeText={setSearch}
      />

      <View style={styles.filterRow}>
        {STATUSES.map(s => (
          <TouchableOpacity
            key={s}
            style={[styles.filterBtn, status === s && styles.filterBtnActive]}
            onPress={() => setStatus(s)}
          >
            <Text style={[styles.filterBtnText, status === s && styles.filterBtnTextActive]}>{s}</Text>
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
              <View style={styles.emptyBox}>
                <Text style={styles.emptyBoxText}>0</Text>
              </View>
              <Text style={styles.emptyText}>No complaints found</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  searchBox: {
    backgroundColor: '#fff', margin: 12, borderRadius: 10,
    padding: 12, fontSize: 14, borderWidth: 1, borderColor: '#dfe6e9', elevation: 1,
  },
  filterRow: { flexDirection: 'row', paddingHorizontal: 12, gap: 6, marginBottom: 8, flexWrap: 'wrap' },
  filterBtn: {
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: '#dfe6e9', backgroundColor: '#fff',
  },
  filterBtnActive: { backgroundColor: '#e67e22', borderColor: '#e67e22' },
  filterBtnText: { fontSize: 12, color: '#7f8c8d', fontWeight: '600' },
  filterBtnTextActive: { color: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 12 },
  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 12,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 3,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#2c3e50' },
  cardCategory: { fontSize: 12, color: '#7f8c8d', marginTop: 2 },
  statusBadge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  statusBadgeText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  cardDesc: { fontSize: 13, color: '#636e72', lineHeight: 18, marginBottom: 8 },
  cardMeta: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', alignItems: 'center' },
  metaText: { fontSize: 12, color: '#95a5a6' },
  priorityDot: { width: 8, height: 8, borderRadius: 4 },
  priorityText: { fontSize: 12, fontWeight: 'bold' },
  escalatedBadge: {
    backgroundColor: '#fff3cd', borderRadius: 6, padding: 4, marginTop: 6,
    alignSelf: 'flex-start', borderWidth: 1, borderColor: '#ffc107',
  },
  escalatedText: { fontSize: 10, fontWeight: 'bold', color: '#d35400', letterSpacing: 1 },
  cardDate: { fontSize: 11, color: '#b2bec3', marginTop: 6, textAlign: 'right' },
  empty: { alignItems: 'center', paddingTop: 40 },
  emptyBox: {
    width: 60, height: 60, borderRadius: 14, backgroundColor: '#ecf0f1',
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  emptyBoxText: { fontSize: 28, fontWeight: 'bold', color: '#bdc3c7' },
  emptyText: { fontSize: 16, color: '#95a5a6' },
});
