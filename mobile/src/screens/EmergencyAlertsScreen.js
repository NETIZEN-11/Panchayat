import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, Modal, TextInput,
  Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import api from '../config/api';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

const EmergencyAlertsScreen = () => {
  const { colors } = useContext(ThemeContext);
  const { user, isSarpanch, isGovt } = useContext(AuthContext);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', type: 'other', severity: 'medium',
    location: '', instructions: '', affectedArea: '', contactNumber: ''
  });

  const isAdmin = isSarpanch() || isGovt();

  useEffect(() => { fetchAlerts(); }, []);

  const fetchAlerts = async () => {
    try {
      const response = await api.get('/emergency');
      setAlerts(response.data.alerts || []);
    } catch { setAlerts([]); }
    finally { setLoading(false); setRefreshing(false); }
  };

  const onRefresh = () => { setRefreshing(true); fetchAlerts(); };

  const handleCreateAlert = async () => {
    if (!formData.title || !formData.description) {
      Alert.alert('Error', 'Please provide title and description');
      return;
    }
    try {
      await api.post('/emergency', { ...formData, village: user.village });
      setModalVisible(false);
      setFormData({ title: '', description: '', type: 'other', severity: 'medium', location: '', instructions: '', affectedArea: '', contactNumber: '' });
      fetchAlerts();
      Alert.alert('Success', 'Emergency alert created');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create alert');
    }
  };

  const getSeverityColor = (severity) => {
    const severityColors = { low: '#27ae60', medium: '#f39c12', high: '#e67e22', critical: '#e74c3c' };
    return severityColors[severity] || '#95a5a6';
  };

  const getTypeIcon = (type) => {
    const icons = { earthquake: '🌍', flood: '🌊', fire: '🔥', landslide: '⛰️', cyclone: '🌀', medical: '🏥', other: '⚠️' };
    return icons[type] || '⚠️';
  };

  const renderAlert = ({ item }) => (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={styles.header}>
        <View style={[styles.typeIcon, { backgroundColor: getSeverityColor(item.severity) }]}>
          <Text style={styles.iconText}>{getTypeIcon(item.type)}</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
          <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(item.severity) }]}>
            <Text style={styles.severityText}>{item.severity.toUpperCase()}</Text>
          </View>
        </View>
      </View>
      <Text style={[styles.description, { color: colors.textSecondary }]}>{item.description}</Text>
      {item.instructions && (
        <View style={[styles.instructionsBox, { backgroundColor: colors.inputBg }]}>
          <Text style={[styles.instructionsLabel, { color: colors.text }]}>Instructions:</Text>
          <Text style={[styles.instructionsText, { color: colors.textSecondary }]}>{item.instructions}</Text>
        </View>
      )}
      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
          {item.location?.village || item.village} • {new Date(item.createdAt).toLocaleDateString('en-IN')}
        </Text>
        {item.contactNumber && (
          <Text style={[styles.contactText, { color: colors.primary }]}>📞 {item.contactNumber}</Text>
        )}
      </View>
    </View>
  );

  if (loading) {
    return <View style={[styles.centered, { backgroundColor: colors.background }]}><ActivityIndicator size="large" color="#e74c3c" /></View>;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {isAdmin && (
        <TouchableOpacity style={styles.createBtn} onPress={() => setModalVisible(true)}>
          <Text style={styles.createBtnText}>+ Create Emergency Alert</Text>
        </TouchableOpacity>
      )}
      <FlatList
        data={alerts}
        renderItem={renderAlert}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No emergency alerts</Text>
          </View>
        }
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Create Emergency Alert</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]} placeholder="Title" placeholderTextColor={colors.textSecondary} value={formData.title} onChangeText={(v) => setFormData({ ...formData, title: v })} />
            <TextInput style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]} placeholder="Description" placeholderTextColor={colors.textSecondary} value={formData.description} onChangeText={(v) => setFormData({ ...formData, description: v })} multiline />
            <View style={styles.row}>
              <TouchableOpacity style={[styles.selectBtn, { backgroundColor: formData.type === 'fire' ? '#e74c3c' : colors.inputBg }]} onPress={() => setFormData({ ...formData, type: 'fire' })}><Text style={{ color: colors.text }}>🔥 Fire</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.selectBtn, { backgroundColor: formData.type === 'flood' ? '#3498db' : colors.inputBg }]} onPress={() => setFormData({ ...formData, type: 'flood' })}><Text style={{ color: colors.text }}>🌊 Flood</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.selectBtn, { backgroundColor: formData.type === 'medical' ? '#27ae60' : colors.inputBg }]} onPress={() => setFormData({ ...formData, type: 'medical' })}><Text style={{ color: colors.text }}>🏥 Medical</Text></TouchableOpacity>
            </View>
            <View style={styles.row}>
              <TouchableOpacity style={[styles.selectBtn, { backgroundColor: formData.severity === 'high' ? '#e67e22' : colors.inputBg }]} onPress={() => setFormData({ ...formData, severity: 'high' })}><Text style={{ color: colors.text }}>High</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.selectBtn, { backgroundColor: formData.severity === 'critical' ? '#e74c3c' : colors.inputBg }]} onPress={() => setFormData({ ...formData, severity: 'critical' })}><Text style={{ color: colors.text }}>Critical</Text></TouchableOpacity>
            </View>
            <TextInput style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]} placeholder="Contact Number" placeholderTextColor={colors.textSecondary} value={formData.contactNumber} onChangeText={(v) => setFormData({ ...formData, contactNumber: v })} keyboardType="phone-pad" />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}><Text style={styles.cancelBtnText}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleCreateAlert}><Text style={styles.submitBtnText}>Send Alert</Text></TouchableOpacity>
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
  createBtn: { backgroundColor: '#e74c3c', margin: 15, padding: 15, borderRadius: 10, alignItems: 'center' },
  createBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  card: { padding: 15, borderRadius: 10, marginBottom: 12, elevation: 3, borderLeftWidth: 4, borderLeftColor: '#e74c3c' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  typeIcon: { width: 45, height: 45, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  iconText: { fontSize: 20 },
  headerInfo: { flex: 1 },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  severityBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  severityText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  description: { fontSize: 14, lineHeight: 20, marginBottom: 10 },
  instructionsBox: { padding: 10, borderRadius: 8, marginBottom: 10 },
  instructionsLabel: { fontSize: 12, fontWeight: 'bold', marginBottom: 4 },
  instructionsText: { fontSize: 13 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTopWidth: 1 },
  footerText: { fontSize: 12 },
  contactText: { fontSize: 12, fontWeight: 'bold' },
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
  submitBtn: { flex: 1, padding: 12, borderRadius: 8, backgroundColor: '#e74c3c', alignItems: 'center' },
  submitBtnText: { color: '#fff', fontWeight: 'bold' },
});

export default EmergencyAlertsScreen;