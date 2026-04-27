import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import { ComplaintContext } from '../context/ComplaintContext';
import { ThemeContext } from '../context/ThemeContext';
import { SkeletonList } from '../components/SkeletonLoader';

const MyComplaintsScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const { myComplaints, loading, getMyComplaints } = useContext(ComplaintContext);
  const { colors } = useContext(ThemeContext);

  useEffect(() => { fetchComplaints(); }, []);

  const fetchComplaints = async () => {
    try { await getMyComplaints(); }
    catch { Alert.alert('Error', 'Failed to fetch complaints'); }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchComplaints();
    setRefreshing(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return '#f39c12';
      case 'In Progress': return '#3498db';
      case 'Resolved': return '#27ae60';
      case 'Rejected': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const renderComplaint = ({ item }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card }]}
      onPress={() => navigation.navigate('ComplaintDetail', { id: item._id })}
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <Text style={[styles.category, { color: colors.primary }]}>{item.category}</Text>
      <Text style={[styles.location, { color: colors.textSecondary }]}>Location: {item.location}</Text>
      <Text style={[styles.date, { color: colors.textSecondary }]}>{new Date(item.createdAt).toLocaleDateString()}</Text>
    </TouchableOpacity>
  );

  if (loading && myComplaints.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <SkeletonList count={5} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {myComplaints.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.text }]}>No complaints filed yet</Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>File a complaint to get started</Text>
        </View>
      ) : (
        <FlatList
          data={myComplaints}
          renderItem={renderComplaint}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  emptySubtext: { fontSize: 14 },
  listContent: { padding: 15 },
  card: {
    borderRadius: 12, padding: 15, marginBottom: 15, elevation: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  title: { fontSize: 16, fontWeight: 'bold', flex: 1 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, marginLeft: 10 },
  statusText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  category: { fontSize: 13, fontWeight: '600', marginBottom: 5 },
  location: { fontSize: 13, marginBottom: 8 },
  date: { fontSize: 12 },
});

export default MyComplaintsScreen;
