import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, RefreshControl, Modal,
} from 'react-native';
import { ComplaintContext } from '../context/ComplaintContext';
import { ThemeContext } from '../context/ThemeContext';

const STATUS_OPTIONS = [
  { label: 'All Status', value: '' }, { label: 'Pending', value: 'Pending' },
  { label: 'In Progress', value: 'In Progress' }, { label: 'Resolved', value: 'Resolved' },
  { label: 'Rejected', value: 'Rejected' },
];
const CATEGORY_OPTIONS = [
  { label: 'All Categories', value: '' }, { label: 'Road', value: 'Road' },
  { label: 'Water', value: 'Water' }, { label: 'Electricity', value: 'Electricity' },
  { label: 'Sanitation', value: 'Sanitation' }, { label: 'Health', value: 'Health' },
  { label: 'Education', value: 'Education' }, { label: 'Other', value: 'Other' },
];

const Dropdown = ({ label, options, selectedValue, onSelect, colors }) => {
  const [showModal, setShowModal] = useState(false);
  const selectedLabel = options.find(o => o.value === selectedValue)?.label || 'Select';
  return (
    <>
      <Text style={[styles.filterLabel, { color: colors.text }]}>{label}</Text>
      <TouchableOpacity style={[styles.dropdown, { backgroundColor: colors.inputBg, borderColor: colors.border }]} onPress={() => setShowModal(true)}>
        <Text style={[styles.dropdownText, { color: colors.text }]}>{selectedLabel}</Text>
        <Text style={[styles.dropdownArrow, { color: colors.textSecondary }]}>▼</Text>
      </TouchableOpacity>
      <Modal visible={showModal} transparent animationType="fade" onRequestClose={() => setShowModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowModal(false)}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{label}</Text>
            {options.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[styles.optionItem, { borderBottomColor: colors.border }, selectedValue === option.value && styles.optionItemSelected]}
                onPress={() => { onSelect(option.value); setShowModal(false); }}
              >
                <Text style={[styles.optionText, { color: colors.text }, selectedValue === option.value && styles.optionTextSelected]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const AdminDashboardScreen = ({ navigation }) => {
  const { colors } = useContext(ThemeContext);
  const [refreshing, setRefreshing] = useState(false);
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const { complaints, loading, getAllComplaints } = useContext(ComplaintContext);

  useEffect(() => { fetchComplaints(); }, [status, category]);

  const fetchComplaints = async () => {
    try { await getAllComplaints({ status: status || undefined, category: category || undefined }); }
    catch { Alert.alert('Error', 'Failed to fetch complaints'); }
  };

  const onRefresh = async () => { setRefreshing(true); await fetchComplaints(); setRefreshing(false); };

  const getStatusColor = (s) => {
    switch (s) {
      case 'Pending': return '#f39c12'; case 'In Progress': return '#3498db';
      case 'Resolved': return '#27ae60'; case 'Rejected': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const renderComplaint = ({ item }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card }]}
      onPress={() => navigation.navigate('AdminComplaintDetail', { id: item._id })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
          <Text style={[styles.userName, { color: colors.textSecondary }]}>By: {item.userId?.name}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <Text style={[styles.category, { color: colors.primary }]}>{item.category}</Text>
      <Text style={[styles.location, { color: colors.textSecondary }]}>Location: {item.location}</Text>
      <Text style={[styles.date, { color: colors.textSecondary }]}>{new Date(item.createdAt).toLocaleDateString()}</Text>
    </TouchableOpacity>
  );

  if (loading && complaints.length === 0) {
    return <View style={[styles.centerContainer, { backgroundColor: colors.background }]}><ActivityIndicator size="large" color="#e74c3c" /></View>;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.filterContainer, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Dropdown label="Filter by Status:" options={STATUS_OPTIONS} selectedValue={status} onSelect={setStatus} colors={colors} />
        <Dropdown label="Filter by Category:" options={CATEGORY_OPTIONS} selectedValue={category} onSelect={setCategory} colors={colors} />
      </View>
      {complaints.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No complaints found</Text>
        </View>
      ) : (
        <FlatList
          data={complaints}
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
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  filterContainer: { padding: 15, borderBottomWidth: 1 },
  filterLabel: { fontSize: 13, fontWeight: 'bold', marginBottom: 8, marginTop: 10 },
  dropdown: { borderRadius: 8, borderWidth: 1, padding: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  dropdownText: { fontSize: 15 },
  dropdownArrow: { fontSize: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { borderRadius: 12, padding: 20, width: '100%', maxWidth: 300 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  optionItem: { padding: 15, borderBottomWidth: 1 },
  optionItemSelected: { backgroundColor: '#fde8e8' },
  optionText: { fontSize: 16 },
  optionTextSelected: { color: '#e74c3c', fontWeight: 'bold' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  emptyText: { fontSize: 18, fontWeight: '600' },
  listContent: { padding: 15 },
  card: { borderRadius: 12, padding: 15, marginBottom: 15, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  headerLeft: { flex: 1 },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  userName: { fontSize: 12 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, marginLeft: 10 },
  statusText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  category: { fontSize: 13, fontWeight: '600', marginBottom: 5, color: '#3498db' },
  location: { fontSize: 13, marginBottom: 8 },
  date: { fontSize: 12 },
});

export default AdminDashboardScreen;
