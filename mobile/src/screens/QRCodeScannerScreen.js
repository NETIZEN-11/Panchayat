import React, { useState, useContext } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert,
  TextInput, Modal,
} from 'react-native';
import api from '../config/api';
import { ThemeContext } from '../context/ThemeContext';

// expo-camera is not included in this build.
// QR scanning is done by entering the scheme ID manually.

const QRCodeScannerScreen = ({ navigation }) => {
  const { colors } = useContext(ThemeContext);
  const [schemeId, setSchemeId] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const verifyScheme = async () => {
    const id = schemeId.trim();
    if (!id) {
      Alert.alert('Error', 'Please enter a Scheme ID');
      return;
    }
    setLoading(true);
    try {
      const response = await api.get(`/schemes/${id}`);
      if (response.data.success) {
        setResultData(response.data.scheme);
        setModalVisible(true);
      }
    } catch (error) {
      let msg = 'This scheme is not registered in our system';
      if (error.message?.includes('Network') || error.message?.includes('connect')) {
        msg = 'Cannot connect to server. Please check your internet connection.';
      } else if (error.response?.status === 404) {
        msg = 'Scheme not found in our database';
      } else if (error.response?.status >= 500) {
        msg = 'Server error. Please try again later.';
      }
      Alert.alert('Verification Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <Text style={styles.headerIcon}>📱</Text>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Verify Scheme Document</Text>
        <Text style={[styles.headerSub, { color: colors.textSecondary }]}>
          Enter the Scheme ID printed on the document to verify its authenticity
        </Text>
      </View>

      {/* Input */}
      <View style={[styles.inputSection, { backgroundColor: colors.card }]}>
        <Text style={[styles.label, { color: colors.text }]}>Scheme ID</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
          placeholder="Enter scheme ID from document..."
          placeholderTextColor={colors.textSecondary}
          value={schemeId}
          onChangeText={setSchemeId}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity
          style={[styles.verifyBtn, loading && styles.verifyBtnDisabled]}
          onPress={verifyScheme}
          disabled={loading}
        >
          <Text style={styles.verifyBtnText}>{loading ? 'Verifying...' : '✓ Verify Document'}</Text>
        </TouchableOpacity>
      </View>

      {/* Info */}
      <View style={[styles.infoBox, { backgroundColor: colors.card }]}>
        <Text style={[styles.infoTitle, { color: colors.text }]}>ℹ️ How to verify:</Text>
        <Text style={[styles.infoText, { color: colors.textSecondary }]}>1. Find the Scheme ID on your document</Text>
        <Text style={[styles.infoText, { color: colors.textSecondary }]}>2. Enter it in the field above</Text>
        <Text style={[styles.infoText, { color: colors.textSecondary }]}>3. Tap Verify to check authenticity</Text>
      </View>

      {/* Result Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedIcon}>✓</Text>
            </View>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Document Verified</Text>
            {resultData && (
              <View style={[styles.resultBox, { backgroundColor: colors.inputBg }]}>
                <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>Scheme Name</Text>
                <Text style={[styles.resultValue, { color: colors.text }]}>{resultData.name || 'N/A'}</Text>
                <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>Category</Text>
                <Text style={[styles.resultValue, { color: colors.text }]}>{resultData.category || 'N/A'}</Text>
                <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>Status</Text>
                <Text style={[styles.resultValue, { color: '#27ae60' }]}>Valid ✓</Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => { setModalVisible(false); setSchemeId(''); setResultData(null); }}
            >
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 25, alignItems: 'center', margin: 15, borderRadius: 15 },
  headerIcon: { fontSize: 48, marginBottom: 10 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  headerSub: { fontSize: 13, marginTop: 6, textAlign: 'center', lineHeight: 18 },
  inputSection: { margin: 15, padding: 20, borderRadius: 15 },
  label: { fontSize: 14, fontWeight: '700', marginBottom: 8 },
  input: {
    borderWidth: 1, borderRadius: 10, padding: 14,
    fontSize: 15, marginBottom: 14,
  },
  verifyBtn: {
    backgroundColor: '#27ae60', borderRadius: 10,
    padding: 16, alignItems: 'center',
  },
  verifyBtnDisabled: { opacity: 0.6 },
  verifyBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  infoBox: { margin: 15, padding: 18, borderRadius: 15 },
  infoTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 10 },
  infoText: { fontSize: 13, marginBottom: 5, lineHeight: 18 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 25 },
  modalContent: { borderRadius: 20, padding: 25, alignItems: 'center' },
  verifiedBadge: {
    width: 70, height: 70, borderRadius: 35,
    backgroundColor: '#27ae60', justifyContent: 'center',
    alignItems: 'center', marginBottom: 15,
  },
  verifiedIcon: { fontSize: 36, color: '#fff', fontWeight: 'bold' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  resultBox: { width: '100%', borderRadius: 12, padding: 15, marginBottom: 20 },
  resultLabel: { fontSize: 11, marginBottom: 2, marginTop: 8 },
  resultValue: { fontSize: 16, fontWeight: 'bold' },
  closeBtn: { backgroundColor: '#3498db', borderRadius: 10, paddingHorizontal: 40, paddingVertical: 14 },
  closeBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default QRCodeScannerScreen;
