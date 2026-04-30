import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, Modal, TextInput,
  Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import api from '../config/api';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

const DocumentsScreen = () => {
  const { colors } = useContext(ThemeContext);
  const { user, isSarpanch, isGovt } = useContext(AuthContext);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({ documentType: 'aadhaar', documentNumber: '', remarks: '' });

  const isAdmin = isSarpanch() || isGovt();

  useEffect(() => { fetchDocuments(); }, []);

  const fetchDocuments = async () => {
    try {
      const endpoint = isAdmin ? '/documents' : '/documents/my-documents';
      const response = await api.get(endpoint);
      setDocuments(response.data.documents || response.data.data || []);
    } catch { setDocuments([]); }
    finally { setLoading(false); setRefreshing(false); }
  };

  const onRefresh = () => { setRefreshing(true); fetchDocuments(); };

  const handleUpload = async () => {
    if (!formData.documentNumber) {
      Alert.alert('Error', 'Please enter document number');
      return;
    }
    try {
      await api.post('/documents', formData);
      setModalVisible(false);
      setFormData({ documentType: 'aadhaar', documentNumber: '', remarks: '' });
      fetchDocuments();
      Alert.alert('Success', 'Document uploaded successfully');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Upload failed');
    }
  };

  const getStatusColor = (status) => {
    const statusColors = { pending: '#f39c12', verified: '#27ae60', rejected: '#e74c3c' };
    return statusColors[status] || '#95a5a6';
  };

  const getDocIcon = (type) => {
    const icons = { aadhaar: '🪪', pan: '💳', voter_id: '🗳️', ration_card: '🥘', birth_certificate: '📜', other: '📄' };
    return icons[type] || '📄';
  };

  const renderDocument = ({ item }) => (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={styles.cardHeader}>
        <Text style={styles.docIcon}>{getDocIcon(item.documentType)}</Text>
        <View style={styles.headerInfo}>
          <Text style={[styles.docType, { color: colors.text }]}>{item.documentType?.replace('_', ' ').toUpperCase()}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.verificationStatus) }]}>
            <Text style={styles.statusText}>{item.verificationStatus?.toUpperCase()}</Text>
          </View>
        </View>
      </View>
      <Text style={[styles.docNumber, { color: colors.textSecondary }]}>Number: {item.documentNumber}</Text>
      {item.remarks && <Text style={[styles.remarks, { color: colors.textSecondary }]}>Remarks: {item.remarks}</Text>}
      {item.verificationStatus === 'rejected' && item.rejectionReason && (
        <Text style={[styles.rejection, { color: '#e74c3c' }]}>Reason: {item.rejectionReason}</Text>
      )}
      <Text style={[styles.date, { color: colors.textSecondary }]}>Uploaded: {new Date(item.createdAt).toLocaleDateString('en-IN')}</Text>
    </View>
  );

  if (loading) {
    return <View style={[styles.centered, { backgroundColor: colors.background }]}><ActivityIndicator size="large" color="#3498db" /></View>;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {!isAdmin && (
        <TouchableOpacity style={styles.uploadBtn} onPress={() => setModalVisible(true)}>
          <Text style={styles.uploadBtnText}>+ Upload Document</Text>
        </TouchableOpacity>
      )}
      <FlatList
        data={documents}
        renderItem={renderDocument}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No documents uploaded</Text>
          </View>
        }
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Upload Document</Text>
            <View style={styles.docTypeRow}>
              {['aadhaar', 'pan', 'voter_id', 'ration_card'].map(type => (
                <TouchableOpacity key={type} style={[styles.docTypeBtn, { backgroundColor: formData.documentType === type ? '#3498db' : colors.inputBg }]} onPress={() => setFormData({ ...formData, documentType: type })}>
                  <Text style={{ color: colors.text, fontSize: 11 }}>{type.replace('_', '\n')}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]} placeholder="Document Number" placeholderTextColor={colors.textSecondary} value={formData.documentNumber} onChangeText={(v) => setFormData({ ...formData, documentNumber: v })} />
            <TextInput style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]} placeholder="Remarks (optional)" placeholderTextColor={colors.textSecondary} value={formData.remarks} onChangeText={(v) => setFormData({ ...formData, remarks: v })} />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}><Text style={styles.cancelBtnText}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleUpload}><Text style={styles.submitBtnText}>Upload</Text></TouchableOpacity>
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
  uploadBtn: { backgroundColor: '#3498db', margin: 15, padding: 15, borderRadius: 10, alignItems: 'center' },
  uploadBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  card: { padding: 15, borderRadius: 10, marginBottom: 12, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  docIcon: { fontSize: 32, marginRight: 12 },
  headerInfo: { flex: 1 },
  docType: { fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  statusText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  docNumber: { fontSize: 13, marginBottom: 5 },
  remarks: { fontSize: 12, fontStyle: 'italic', marginBottom: 5 },
  rejection: { fontSize: 12, fontWeight: 'bold', marginBottom: 5 },
  date: { fontSize: 11 },
  empty: { alignItems: 'center', marginTop: 50 },
  emptyText: { fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { borderRadius: 15, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  docTypeRow: { flexDirection: 'row', gap: 8, marginBottom: 15 },
  docTypeBtn: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center' },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 10, fontSize: 14 },
  modalBtns: { flexDirection: 'row', gap: 10, marginTop: 10 },
  cancelBtn: { flex: 1, padding: 12, borderRadius: 8, backgroundColor: '#95a5a6', alignItems: 'center' },
  cancelBtnText: { color: '#fff', fontWeight: 'bold' },
  submitBtn: { flex: 1, padding: 12, borderRadius: 8, backgroundColor: '#3498db', alignItems: 'center' },
  submitBtnText: { color: '#fff', fontWeight: 'bold' },
});

export default DocumentsScreen;