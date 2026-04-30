import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, Modal, TextInput,
  Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import api from '../config/api';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

const LostFoundScreen = () => {
  const { colors } = useContext(ThemeContext);
  const { user, isSarpanch, isGovt } = useContext(AuthContext);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [formData, setFormData] = useState({
    type: 'lost', category: 'other', title: '', description: '',
    location: '', dateLostFound: '', contactName: '', contactPhone: ''
  });

  useEffect(() => { fetchEntries(); }, []);

  const fetchEntries = async () => {
    try {
      const response = await api.get('/lostfound');
      setEntries(response.data.entries || []);
    } catch { setEntries([]); }
    finally { setLoading(false); setRefreshing(false); }
  };

  const onRefresh = () => { setRefreshing(true); fetchEntries(); };

  const handleCreateEntry = async () => {
    if (!formData.title || !formData.description || !formData.location || !formData.contactName || !formData.contactPhone) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    try {
      await api.post('/lostfound', formData);
      setModalVisible(false);
      setFormData({ type: 'lost', category: 'other', title: '', description: '', location: '', dateLostFound: '', contactName: '', contactPhone: '' });
      fetchEntries();
      Alert.alert('Success', 'Entry posted successfully');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to post entry');
    }
  };

  const handleClaim = async (id) => {
    try {
      await api.put(`/lostfound/${id}/claim`);
      fetchEntries();
      Alert.alert('Success', 'Item claimed successfully');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to claim');
    }
  };

  const filteredEntries = filterType === 'all' ? entries : entries.filter(e => e.type === filterType);

  const getCategoryIcon = (category) => {
    const icons = { person: '👤', animal: '🐄', document: '📄', vehicle: '🚗', electronics: '📱', jewelry: '💍', clothing: '👕', other: '📦' };
    return icons[category] || '📦';
  };

  const renderEntry = ({ item }) => (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={styles.header}>
        <View style={[styles.typeBadge, { backgroundColor: item.type === 'lost' ? '#e74c3c' : '#27ae60' }]}>
          <Text style={styles.typeText}>{item.type.toUpperCase()}</Text>
        </View>
        <Text style={styles.categoryIcon}>{getCategoryIcon(item.category)}</Text>
      </View>
      <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
      <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>{item.description}</Text>
      <View style={styles.infoRow}>
        <Text style={[styles.infoText, { color: colors.text }]}>📍 {item.location}</Text>
        <Text style={[styles.infoText, { color: colors.textSecondary }]}>📅 {new Date(item.dateLostFound).toLocaleDateString('en-IN')}</Text>
      </View>
      <View style={[styles.contactBox, { backgroundColor: colors.inputBg }]}>
        <Text style={[styles.contactName, { color: colors.text }]}>👤 {item.contactName}</Text>
        <Text style={[styles.contactPhone, { color: colors.primary }]}>📞 {item.contactPhone}</Text>
      </View>
      {item.status === 'open' && (
        <TouchableOpacity style={styles.claimBtn} onPress={() => handleClaim(item._id)}>
          <Text style={styles.claimBtnText}>Mark as Claimed</Text>
        </TouchableOpacity>
      )}
      {item.status !== 'open' && (
        <View style={[styles.statusBadge, { backgroundColor: '#27ae60' }]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      )}
    </View>
  );

  if (loading) {
    return <View style={[styles.centered, { backgroundColor: colors.background }]}><ActivityIndicator size="large" color="#3498db" /></View>;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.filterRow}>
        <TouchableOpacity style={[styles.filterBtn, { backgroundColor: filterType === 'all' ? '#3498db' : colors.inputBg }]} onPress={() => setFilterType('all')}>
          <Text style={{ color: filterType === 'all' ? '#fff' : colors.text }}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterBtn, { backgroundColor: filterType === 'lost' ? '#e74c3c' : colors.inputBg }]} onPress={() => setFilterType('lost')}>
          <Text style={{ color: filterType === 'lost' ? '#fff' : colors.text }}>Lost</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterBtn, { backgroundColor: filterType === 'found' ? '#27ae60' : colors.inputBg }]} onPress={() => setFilterType('found')}>
          <Text style={{ color: filterType === 'found' ? '#fff' : colors.text }}>Found</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.createBtn} onPress={() => setModalVisible(true)}>
        <Text style={styles.createBtnText}>+ Report Lost/Found Item</Text>
      </TouchableOpacity>

      <FlatList
        data={filteredEntries}
        renderItem={renderEntry}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No entries found</Text>
          </View>
        }
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Report Lost/Found</Text>
            <View style={styles.row}>
              <TouchableOpacity style={[styles.selectBtn, { backgroundColor: formData.type === 'lost' ? '#e74c3c' : colors.inputBg }]} onPress={() => setFormData({ ...formData, type: 'lost' })}>
                <Text style={{ color: colors.text }}>🔴 Lost</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.selectBtn, { backgroundColor: formData.type === 'found' ? '#27ae60' : colors.inputBg }]} onPress={() => setFormData({ ...formData, type: 'found' })}>
                <Text style={{ color: colors.text }}>🟢 Found</Text>
              </TouchableOpacity>
            </View>
            <TextInput style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]} placeholder="Title" placeholderTextColor={colors.textSecondary} value={formData.title} onChangeText={(v) => setFormData({ ...formData, title: v })} />
            <TextInput style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]} placeholder="Description" placeholderTextColor={colors.textSecondary} value={formData.description} onChangeText={(v) => setFormData({ ...formData, description: v })} multiline />
            <TextInput style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]} placeholder="Location" placeholderTextColor={colors.textSecondary} value={formData.location} onChangeText={(v) => setFormData({ ...formData, location: v })} />
            <View style={styles.row}>
              <TextInput style={[styles.input, { flex: 1, backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]} placeholder="Your Name" placeholderTextColor={colors.textSecondary} value={formData.contactName} onChangeText={(v) => setFormData({ ...formData, contactName: v })} />
              <TextInput style={[styles.input, { flex: 1, backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]} placeholder="Phone" placeholderTextColor={colors.textSecondary} value={formData.contactPhone} onChangeText={(v) => setFormData({ ...formData, contactPhone: v })} keyboardType="phone-pad" />
            </View>
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}><Text style={styles.cancelBtnText}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleCreateEntry}><Text style={styles.submitBtnText}>Submit</Text></TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  filterRow: { flexDirection: 'row', padding: 15, gap: 10 },
  filterBtn: { flex: 1, padding: 10, borderRadius: 8, alignItems: 'center' },
  createBtn: { backgroundColor: '#3498db', marginHorizontal: 15, marginBottom: 10, padding: 12, borderRadius: 10, alignItems: 'center' },
  createBtnText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  list: { padding: 15, paddingTop: 0 },
  card: { padding: 15, borderRadius: 10, marginBottom: 12, elevation: 2 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  typeText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  categoryIcon: { fontSize: 24 },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 6 },
  description: { fontSize: 13, marginBottom: 10, lineHeight: 18 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  infoText: { fontSize: 12 },
  contactBox: { padding: 10, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between' },
  contactName: { fontSize: 13, fontWeight: 'bold' },
  contactPhone: { fontSize: 13, fontWeight: 'bold' },
  claimBtn: { backgroundColor: '#27ae60', padding: 10, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  claimBtnText: { color: '#fff', fontWeight: 'bold' },
  statusBadge: { alignSelf: 'center', paddingHorizontal: 15, paddingVertical: 5, borderRadius: 10, marginTop: 10 },
  statusText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  empty: { alignItems: 'center', marginTop: 50 },
  emptyText: { fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { borderRadius: 15, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 10, fontSize: 14 },
  row: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  selectBtn: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center' },
  modalBtns: { flexDirection: 'row', gap: 10, marginTop: 10 },
  cancelBtn: { flex: 1, padding: 12, borderRadius: 8, backgroundColor: '#95a5a6', alignItems: 'center' },
  cancelBtnText: { color: '#fff', fontWeight: 'bold' },
  submitBtn: { flex: 1, padding: 12, borderRadius: 8, backgroundColor: '#3498db', alignItems: 'center' },
  submitBtnText: { color: '#fff', fontWeight: 'bold' },
});

export default LostFoundScreen;