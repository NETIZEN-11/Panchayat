import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, Modal, TextInput,
  Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import api from '../config/api';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

const MeetingsScreen = () => {
  const { colors } = useContext(ThemeContext);
  const { user, isSarpanch, isGovt } = useContext(AuthContext);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', meetingType: 'gram_sabha',
    scheduledAt: '', duration: 120, location: ''
  });

  const isAdmin = isSarpanch() || isGovt();

  useEffect(() => { fetchMeetings(); }, []);

  const fetchMeetings = async () => {
    try {
      const response = await api.get('/meetings?upcoming=true');
      setMeetings(response.data.meetings || []);
    } catch { setMeetings([]); }
    finally { setLoading(false); setRefreshing(false); }
  };

  const onRefresh = () => { setRefreshing(true); fetchMeetings(); };

  const handleCreateMeeting = async () => {
    if (!formData.title || !formData.description || !formData.scheduledAt || !formData.location) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    try {
      await api.post('/meetings', formData);
      setModalVisible(false);
      setFormData({ title: '', description: '', meetingType: 'gram_sabha', scheduledAt: '', duration: 120, location: '' });
      fetchMeetings();
      Alert.alert('Success', 'Meeting scheduled');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create meeting');
    }
  };

  const getTypeLabel = (type) => {
    const labels = { gram_sabha: 'Gram Sabha', panchayat: 'Panchayat', committee: 'Committee', emergency: 'Emergency', other: 'Other' };
    return labels[type] || 'Other';
  };

  const getTypeColor = (type) => {
    const colors = { gram_sabha: '#27ae60', panchayat: '#3498db', committee: '#9b59b6', emergency: '#e74c3c', other: '#95a5a6' };
    return colors[type] || '#95a5a6';
  };

  const formatDateTime = (date) => {
    const d = new Date(date);
    return `${d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })} at ${d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
  };

  const renderMeeting = ({ item }) => (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={[styles.typeBadge, { backgroundColor: getTypeColor(item.meetingType) }]}>
        <Text style={styles.typeText}>{getTypeLabel(item.meetingType)}</Text>
      </View>
      <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
      <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>{item.description}</Text>
      <View style={styles.infoGrid}>
        <View style={styles.infoItem}>
          <Text style={styles.infoIcon}>📅</Text>
          <Text style={[styles.infoText, { color: colors.text }]}>{formatDateTime(item.scheduledAt)}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoIcon}>⏱️</Text>
          <Text style={[styles.infoText, { color: colors.text }]}>{item.duration} min</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoIcon}>📍</Text>
          <Text style={[styles.infoText, { color: colors.text }]}>{item.location}</Text>
        </View>
      </View>
      {item.agenda && item.agenda.length > 0 && (
        <View style={[styles.agendaBox, { backgroundColor: colors.inputBg }]}>
          <Text style={[styles.agendaLabel, { color: colors.text }]}>Agenda:</Text>
          {item.agenda.slice(0, 3).map((a, i) => (
            <Text key={i} style={[styles.agendaItem, { color: colors.textSecondary }]}>• {a.item}</Text>
          ))}
        </View>
      )}
      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>Created by: {item.createdBy?.name || 'Admin'}</Text>
        {item.isCompleted && <Text style={[styles.completedBadge, { color: '#27ae60' }]}>✓ Completed</Text>}
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
          <Text style={styles.createBtnText}>+ Schedule Meeting</Text>
        </TouchableOpacity>
      )}
      <FlatList
        data={meetings}
        renderItem={renderMeeting}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No upcoming meetings</Text>
          </View>
        }
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Schedule Meeting</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]} placeholder="Meeting Title" placeholderTextColor={colors.textSecondary} value={formData.title} onChangeText={(v) => setFormData({ ...formData, title: v })} />
            <TextInput style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]} placeholder="Description" placeholderTextColor={colors.textSecondary} value={formData.description} onChangeText={(v) => setFormData({ ...formData, description: v })} multiline />
            <View style={styles.row}>
              <TouchableOpacity style={[styles.selectBtn, { backgroundColor: formData.meetingType === 'gram_sabha' ? '#27ae60' : colors.inputBg }]} onPress={() => setFormData({ ...formData, meetingType: 'gram_sabha' })}><Text style={{ color: colors.text }}>Gram Sabha</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.selectBtn, { backgroundColor: formData.meetingType === 'panchayat' ? '#3498db' : colors.inputBg }]} onPress={() => setFormData({ ...formData, meetingType: 'panchayat' })}><Text style={{ color: colors.text }}>Panchayat</Text></TouchableOpacity>
            </View>
            <TextInput style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]} placeholder="Date & Time (YYYY-MM-DD HH:MM)" placeholderTextColor={colors.textSecondary} value={formData.scheduledAt} onChangeText={(v) => setFormData({ ...formData, scheduledAt: v })} />
            <TextInput style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]} placeholder="Location" placeholderTextColor={colors.textSecondary} value={formData.location} onChangeText={(v) => setFormData({ ...formData, location: v })} />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}><Text style={styles.cancelBtnText}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleCreateMeeting}><Text style={styles.submitBtnText}>Schedule</Text></TouchableOpacity>
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
  typeBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, marginBottom: 10 },
  typeText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  title: { fontSize: 17, fontWeight: 'bold', marginBottom: 6 },
  description: { fontSize: 13, marginBottom: 12, lineHeight: 18 },
  infoGrid: { gap: 8, marginBottom: 10 },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoIcon: { fontSize: 14 },
  infoText: { fontSize: 13 },
  agendaBox: { padding: 10, borderRadius: 8, marginBottom: 10 },
  agendaLabel: { fontSize: 12, fontWeight: 'bold', marginBottom: 4 },
  agendaItem: { fontSize: 12, marginLeft: 8 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTopWidth: 1 },
  footerText: { fontSize: 12 },
  completedBadge: { fontSize: 12, fontWeight: 'bold' },
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

export default MeetingsScreen;