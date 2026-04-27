import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, RefreshControl, TextInput, Modal,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { AuthContext } from '../context/AuthContext';
import api from '../config/api';

const DEPARTMENTS = ['Road', 'Water', 'Electricity', 'Sanitation', 'Health', 'Education', 'Drainage', 'Public Works', 'Other'];

export default function WorkersScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Road');
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchWorkers(); }, []);

  const fetchWorkers = async () => {
    try {
      const res = await api.get(`/workers?village=${user.village}`);
      setWorkers(res.data.data || []);
    } catch (err) {
      console.error('Error fetching workers:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => { setRefreshing(true); fetchWorkers(); };

  const handleAddWorker = async () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert('Error', 'Name and phone are required'); return;
    }
    setSaving(true);
    try {
      await api.post('/workers', { name: name.trim(), phone: phone.trim(), department, village: user.village });
      Alert.alert('Success', 'Worker added');
      setShowAddModal(false); setName(''); setPhone(''); setDepartment('Road');
      fetchWorkers();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to add worker');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteWorker = async (workerId) => {
    Alert.alert('Remove Worker', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/workers/${workerId}`);
            setWorkers(prev => prev.filter(w => w._id !== workerId));
          } catch {
            Alert.alert('Error', 'Failed to remove worker');
          }
        },
      },
    ]);
  };

  const renderWorker = ({ item }) => {
    const deptColor = DEPARTMENTS.indexOf(item.department) % 8;
    const COLORS = ['#e74c3c', '#3498db', '#f39c12', '#27ae60', '#9b59b6', '#e67e22', '#00bcd4', '#607d8b'];
    return (
      <View style={styles.card}>
        <View style={styles.cardLeft}>
          <View style={[styles.deptBadge, { backgroundColor: COLORS[deptColor] }]}>
            <Text style={styles.deptBadgeText}>{item.department?.slice(0, 3).toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.workerName}>{item.name}</Text>
            <Text style={styles.workerPhone}>{item.phone}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteWorker(item._id)}>
          <Text style={styles.deleteBtnText}>X</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color="#e67e22" /></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Village Workers</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddModal(true)}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={workers}
        renderItem={renderWorker}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyText}>No workers added yet</Text></View>}
      />

      {/* Add Worker Modal */}
      <Modal visible={showAddModal} transparent animationType="slide" onRequestClose={() => setShowAddModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Worker</Text>
            <Text style={styles.label}>Name</Text>
            <TextInput style={styles.input} placeholder="Worker name" value={name} onChangeText={setName} />
            <Text style={styles.label}>Phone</Text>
            <TextInput style={styles.input} placeholder="Phone number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            <Text style={styles.label}>Department</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={department} onValueChange={setDepartment}>
                {DEPARTMENTS.map(d => <Picker.Item key={d} label={d} value={d} />)}
              </Picker>
            </View>
            <View style={styles.modalBtns}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#e74c3c' }]} onPress={() => setShowAddModal(false)}>
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#27ae60' }, saving && { opacity: 0.6 }]} onPress={handleAddWorker} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalBtnText}>Save</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: '#e67e22', padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  addBtn: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  addBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  list: { padding: 15 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', elevation: 2 },
  cardLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  deptBadge: { width: 44, height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  deptBadgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  workerName: { fontSize: 15, fontWeight: 'bold', color: '#2c3e50' },
  workerPhone: { fontSize: 13, color: '#7f8c8d', marginTop: 2 },
  deleteBtn: { backgroundColor: '#e74c3c', borderRadius: 8, padding: 8 },
  deleteBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  empty: { alignItems: 'center', paddingTop: 50 },
  emptyText: { fontSize: 16, color: '#95a5a6' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50', marginBottom: 15, textAlign: 'center' },
  label: { fontSize: 12, fontWeight: '700', color: '#7f8c8d', marginTop: 10, marginBottom: 4 },
  input: { backgroundColor: '#f8f9fa', borderRadius: 8, borderWidth: 1, borderColor: '#dfe6e9', padding: 12, fontSize: 14 },
  pickerContainer: { backgroundColor: '#f8f9fa', borderRadius: 8, borderWidth: 1, borderColor: '#dfe6e9', overflow: 'hidden' },
  modalBtns: { flexDirection: 'row', gap: 10, marginTop: 20 },
  modalBtn: { flex: 1, borderRadius: 10, padding: 14, alignItems: 'center' },
  modalBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});
