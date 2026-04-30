import React, { useState, useContext } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import api from '../config/api';
import { ThemeContext } from '../context/ThemeContext';

const GrievanceScreen = () => {
  const { colors } = useContext(ThemeContext);
  const [formData, setFormData] = useState({
    complaintId: '',
    escalateTo: 'district',
    reason: '',
    supportingDocs: ''
  });

  const handleSubmit = async () => {
    if (!formData.complaintId || !formData.reason) {
      Alert.alert('Error', 'Please provide complaint ID and reason');
      return;
    }
    try {
      await api.post(`/complaints/${formData.complaintId}/escalate`, {
        reason: formData.reason,
        escalateTo: formData.escalateTo
      });
      Alert.alert('Success', 'Grievance escalated to higher authority');
      setFormData({ complaintId: '', escalateTo: 'district', reason: '', supportingDocs: '' });
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to escalate');
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <Text style={styles.headerIcon}>📮</Text>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Grievance Redressal</Text>
        <Text style={[styles.headerSub, { color: colors.textSecondary }]}>Escalate your complaint to higher authorities</Text>
      </View>

      <View style={[styles.form, { backgroundColor: colors.card }]}>
        <Text style={[styles.label, { color: colors.text }]}>Complaint ID *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
          placeholder="Enter your complaint ID"
          placeholderTextColor={colors.textSecondary}
          value={formData.complaintId}
          onChangeText={(v) => setFormData({ ...formData, complaintId: v })}
        />

        <Text style={[styles.label, { color: colors.text }]}>Escalate To *</Text>
        <View style={styles.escalateOptions}>
          <TouchableOpacity
            style={[styles.optionBtn, { backgroundColor: formData.escalateTo === 'district' ? '#3498db' : colors.inputBg }]}
            onPress={() => setFormData({ ...formData, escalateTo: 'district' })}
          >
            <Text style={{ color: colors.text }}>🏛️ District</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.optionBtn, { backgroundColor: formData.escalateTo === 'state' ? '#9b59b6' : colors.inputBg }]}
            onPress={() => setFormData({ ...formData, escalateTo: 'state' })}
          >
            <Text style={{ color: colors.text }}>🏛️ State</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.optionBtn, { backgroundColor: formData.escalateTo === 'central' ? '#e67e22' : colors.inputBg }]}
            onPress={() => setFormData({ ...formData, escalateTo: 'central' })}
          >
            <Text style={{ color: colors.text }}>🏛️ Central</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.label, { color: colors.text }]}>Reason for Escalation *</Text>
        <TextInput
          style={[styles.input, styles.textArea, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
          placeholder="Explain why you are escalating this complaint..."
          placeholderTextColor={colors.textSecondary}
          value={formData.reason}
          onChangeText={(v) => setFormData({ ...formData, reason: v })}
          multiline
          numberOfLines={4}
        />

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitBtnText}>Submit Escalation</Text>
        </TouchableOpacity>

        <View style={[styles.infoBox, { backgroundColor: colors.inputBg }]}>
          <Text style={[styles.infoTitle, { color: colors.text }]}>ℹ️ Note:</Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>• Escalation will be reviewed by senior officers</Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>• You will be notified of the decision</Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>• Original complaint status will be preserved</Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 25, alignItems: 'center' },
  headerIcon: { fontSize: 40, marginBottom: 10 },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  headerSub: { fontSize: 13, marginTop: 5, textAlign: 'center' },
  form: { margin: 15, padding: 20, borderRadius: 15 },
  label: { fontSize: 14, fontWeight: 'bold', marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 15, fontSize: 14 },
  textArea: { height: 100, textAlignVertical: 'top' },
  escalateOptions: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  optionBtn: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center' },
  submitBtn: { backgroundColor: '#3498db', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  infoBox: { marginTop: 20, padding: 15, borderRadius: 10 },
  infoTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 8 },
  infoText: { fontSize: 12, marginBottom: 4 },
});

export default GrievanceScreen;