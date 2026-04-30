import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, Modal, TextInput,
  Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import api from '../config/api';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

const AssetsScreen = () => {
  const { colors } = useContext(ThemeContext);
  const { user, isSarpanch, isGovt } = useContext(AuthContext);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: '', category: 'equipment', description: '', assetCode: '',
    purchaseDate: '', purchaseCost: '', currentValue: '', condition: 'good', location: ''
  });

  const isAdmin = isSarpanch() || isGovt();

  useEffect(() => { fetchAssets(); }, []);

  const fetchAssets = async () => {
    try {
      const response = await api.get('/assets');
      setAssets(response.data.assets || []);
    } catch { setAssets([]); }
    finally { setLoading(false); setRefreshing(false); }
  };

  const onRefresh = () => { setRefreshing(true); fetchAssets(); };

  const handleCreateAsset = async () => {
    if (!formData.name || !formData.description || !formData.location) {
      Alert.alert('Error', 'Please fill required fields');
      return;
    }
    try {
      await api.post('/assets', formData);
      setModalVisible(false);
      setFormData({ name: '', category: 'equipment', description: '', assetCode: '', purchaseDate: '', purchaseCost: '', currentValue: '', condition: 'good', location: '' });
      fetchAssets();
      Alert.alert('Success', 'Asset added');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create asset');
    }
  };

  const getConditionColor = (condition) => {
    const conditionColors = { excellent: '#27ae60', good: '#3498db', fair: '#f39c12', poor: '#e67e22', scrap: '#e74c3c' };
    return conditionColors[condition] || '#95a5a6';
  };

  const getCategoryIcon = (category) => {
    const icons = { vehicle: '🚗', equipment: '🔧', furniture: '🪑', electronics: '📱', office: '🏢', agriculture: '🌾', construction: '🏗️', other: '📦' };
    return icons[category] || '📦';
  };

  const renderAsset = ({ item }) => (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={styles.cardHeader}>
        <Text style={styles.categoryIcon}>{getCategoryIcon(item.category)}</Text>
        <View style={styles.headerInfo}>
          <Text style={[styles.assetName, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.categoryLabel, { color: colors.textSecondary }]}>{item.category}</Text>
        </View>
        <View style={[styles.conditionBadge, { backgroundColor: getConditionColor(item.condition) }]}>
          <Text style={styles.conditionText}>{item.condition?.toUpperCase()}</Text>
        </View>
      </View>
      <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>{item.description}</Text>
      <View style={styles.infoRow}>
        <Text style={[styles.infoText, { color: colors.text }]}>📍 {item.location}</Text>
        {item.assetCode && <Text style={[styles.infoText, { color: colors.textSecondary }]}>📋 {item.assetCode}</Text>}
      </View>
      {item.assignedToName && (
        <View style={[styles.assignedBox, { backgroundColor: colors.inputBg }]}>
          <Text style={[styles.assignedLabel, { color: colors.text }]}>Assigned to: {item.assignedToName}</Text>
        </View>
      )}
      {item.maintenanceHistory && item.maintenanceHistory.length > 0 && (
        <View style={styles.maintenanceInfo}>
          <Text style={[styles.maintenanceCount, { color: colors.textSecondary }]}>🔧 {item.maintenanceHistory.length} maintenance records</Text>
        </View>
      )}
      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>{item.village}</Text>
        {item.purchaseCost && <Text style={[styles.costText, { color: '#27ae60' }]}>₹{item.purchaseCost.toLocaleString('en-IN')}</Text>}
      </View>
    </View>
  );

  if (loading) {
    return <View style={[styles.centered, { backgroundColor: colors.background }]}><ActivityIndicator size="large" color="#3498db" /></View>;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {isAdmin && (
        <TouchableOpacity style={styles.createBtn} onPress={() => setModalVisible(true)}>
          <Text style={styles.createBtnText}>+ Add Asset</Text>
        </TouchableOpacity>
      )}
      <FlatList
        data={assets}
        renderItem={renderAsset}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No assets found</Text>
          </View>
        }
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Add New Asset</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]} placeholder="Asset Name" placeholderTextColor={colors.textSecondary} value={formData.name} onChangeText={(v) => setFormData({ ...formData, name: v })} />
            <View style={styles.row}>
              <TouchableOpacity style={[styles.selectBtn, { backgroundColor: formData.category === 'vehicle' ? '#3498db' : colors.inputBg }]} onPress={() => setFormData({ ...formData, category: 'vehicle' })}><Text style={{ color: colors.text }}>🚗</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.selectBtn, { backgroundColor: formData.category === 'equipment' ? '#3498db' : colors.inputBg }]} onPress={() => setFormData({ ...formData, category: 'equipment' })}><Text style={{ color: colors.text }}>🔧</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.selectBtn, { backgroundColor: formData.category === 'electronics' ? '#3498db' : colors.inputBg }]} onPress={() => setFormData({ ...formData, category: 'electronics' })}><Text style={{ color: colors.text }}>📱</Text></TouchableOpacity>
            </View>
            <TextInput style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]} placeholder="Description" placeholderTextColor={colors.textSecondary} value={formData.description} onChangeText={(v) => setFormData({ ...formData, description: v })} multiline />
            <TextInput style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]} placeholder="Location" placeholderTextColor={colors.textSecondary} value={formData.location} onChangeText={(v) => setFormData({ ...formData, location: v })} />
            <View style={styles.row}>
              <TextInput style={[styles.input, { flex: 1, backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]} placeholder="Purchase Cost" placeholderTextColor={colors.textSecondary} value={formData.purchaseCost} onChangeText={(v) => setFormData({ ...formData, purchaseCost: v })} keyboardType="numeric" />
              <TextInput style={[styles.input, { flex: 1, backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]} placeholder="Asset Code" placeholderTextColor={colors.textSecondary} value={formData.assetCode} onChangeText={(v) => setFormData({ ...formData, assetCode: v })} />
            </View>
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}><Text style={styles.cancelBtnText}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleCreateAsset}><Text style={styles.submitBtnText}>Add Asset</Text></TouchableOpacity>
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
  list: { padding: 15 },
  createBtn: { backgroundColor: '#3498db', margin: 15, padding: 15, borderRadius: 10, alignItems: 'center' },
  createBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  card: { padding: 15, borderRadius: 10, marginBottom: 12, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  categoryIcon: { fontSize: 28, marginRight: 12 },
  headerInfo: { flex: 1 },
  assetName: { fontSize: 15, fontWeight: 'bold', marginBottom: 2 },
  categoryLabel: { fontSize: 12 },
  conditionBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  conditionText: { color: '#fff', fontSize: 9, fontWeight: 'bold' },
  description: { fontSize: 13, marginBottom: 10, lineHeight: 18 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  infoText: { fontSize: 12 },
  assignedBox: { padding: 8, borderRadius: 6, marginBottom: 8 },
  assignedLabel: { fontSize: 12, fontWeight: '500' },
  maintenanceInfo: { marginBottom: 8 },
  maintenanceCount: { fontSize: 12 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTopWidth: 1 },
  footerText: { fontSize: 12 },
  costText: { fontSize: 13, fontWeight: 'bold' },
  empty: { alignItems: 'center', marginTop: 50 },
  emptyText: { fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { borderRadius: 15, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 10, fontSize: 14 },
  row: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  selectBtn: { flex: 1, padding: 10, borderRadius: 8, alignItems: 'center' },
  modalBtns: { flexDirection: 'row', gap: 10, marginTop: 10 },
  cancelBtn: { flex: 1, padding: 12, borderRadius: 8, backgroundColor: '#95a5a6', alignItems: 'center' },
  cancelBtnText: { color: '#fff', fontWeight: 'bold' },
  submitBtn: { flex: 1, padding: 12, borderRadius: 8, backgroundColor: '#3498db', alignItems: 'center' },
  submitBtnText: { color: '#fff', fontWeight: 'bold' },
});

export default AssetsScreen;