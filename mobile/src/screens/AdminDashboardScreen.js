import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Modal,
} from 'react-native';
import { ComplaintContext } from '../context/ComplaintContext';

const STATUS_OPTIONS = [
  { label: 'All Status', value: '' },
  { label: 'Pending', value: 'Pending' },
  { label: 'In Progress', value: 'In Progress' },
  { label: 'Resolved', value: 'Resolved' },
  { label: 'Rejected', value: 'Rejected' },
];

const CATEGORY_OPTIONS = [
  { label: 'All Categories', value: '' },
  { label: 'Road', value: 'Road' },
  { label: 'Water', value: 'Water' },
  { label: 'Electricity', value: 'Electricity' },
  { label: 'Sanitation', value: 'Sanitation' },
  { label: 'Health', value: 'Health' },
  { label: 'Education', value: 'Education' },
  { label: 'Other', value: 'Other' },
];

const Dropdown = ({ label, options, selectedValue, onSelect }) => {
  const [showModal, setShowModal] = useState(false);
  const selectedLabel = options.find(o => o.value === selectedValue)?.label || 'Select';

  return (
    <>
      <Text style={styles.filterLabel}>{label}</Text>
      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => setShowModal(true)}
      >
        <Text style={styles.dropdownText}>{selectedLabel}</Text>
        <Text style={styles.dropdownArrow}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{label}</Text>
            {options.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionItem,
                  selectedValue === option.value && styles.optionItemSelected
                ]}
                onPress={() => {
                  onSelect(option.value);
                  setShowModal(false);
                }}
              >
                <Text style={[
                  styles.optionText,
                  selectedValue === option.value && styles.optionTextSelected
                ]}>
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
  const [refreshing, setRefreshing] = useState(false);
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const { complaints, loading, getAllComplaints } = useContext(ComplaintContext);

  useEffect(() => {
    fetchComplaints();
  }, [status, category]);

  const fetchComplaints = async () => {
    try {
      await getAllComplaints({
        status: status || undefined,
        category: category || undefined,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch complaints');
    }
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
      style={styles.card}
      onPress={() => navigation.navigate('AdminComplaintDetail', { id: item._id })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.userName}>By: {item.userId?.name}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <Text style={styles.category}>{item.category}</Text>
      <Text style={styles.location}>Location: {item.location}</Text>
      <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
    </TouchableOpacity>
  );

  if (loading && complaints.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#e74c3c" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <Dropdown
          label="Filter by Status:"
          options={STATUS_OPTIONS}
          selectedValue={status}
          onSelect={setStatus}
        />
        <Dropdown
          label="Filter by Category:"
          options={CATEGORY_OPTIONS}
          selectedValue={category}
          onSelect={setCategory}
        />
      </View>

      {complaints.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>---</Text>
          <Text style={styles.emptyText}>No complaints found</Text>
          <Text style={styles.emptySubtext}>Complaints will appear here when submitted</Text>
        </View>
      ) : (
        <FlatList
          data={complaints}
          renderItem={renderComplaint}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
    marginTop: 10,
  },
  dropdown: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ecf0f1',
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  dropdownText: {
    fontSize: 15,
    color: '#2c3e50',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
    textAlign: 'center',
  },
  optionItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  optionItemSelected: {
    backgroundColor: '#fde8e8',
  },
  optionText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  optionTextSelected: {
    color: '#e74c3c',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 15,
  },
  emptyText: {
    fontSize: 18,
    color: '#7f8c8d',
    fontWeight: '600',
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#95a5a6',
    textAlign: 'center',
  },
  listContent: {
    padding: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  userName: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginLeft: 10,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  category: {
    fontSize: 13,
    color: '#3498db',
    fontWeight: '600',
    marginBottom: 5,
  },
  location: {
    fontSize: 13,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    color: '#95a5a6',
  },
});

export default AdminDashboardScreen;
