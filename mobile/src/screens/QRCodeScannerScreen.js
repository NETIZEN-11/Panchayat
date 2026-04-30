import React, { useState, useContext } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert,
  TextInput, Modal, Platform,
} from 'react-native';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import api from '../config/api';
import { ThemeContext } from '../context/ThemeContext';

const QRCodeScannerScreen = ({ navigation }) => {
  const { colors } = useContext(ThemeContext);
  const [scanned, setScanned] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [resultData, setResultData] = useState(null);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    try {
      const parsed = JSON.parse(data);
      setResultData(parsed);
      setModalVisible(true);
    } catch {
      Alert.alert('Invalid QR', 'This QR code is not a valid scheme document', [
        { text: 'Scan Again', onPress: () => setScanned(false) }
      ]);
    }
  };

  const verifyWithBackend = async () => {
    if (!resultData?.id) return;
    try {
      const response = await api.get(`/schemes/${resultData.id}`);
      if (response.data.success) {
        Alert.alert('✓ Verified', `Scheme: ${response.data.scheme.name}\nStatus: Valid Document`, [
          { text: 'OK', onPress: () => { setModalVisible(false); setScanned(false); } }
        ]);
      }
    } catch {
      Alert.alert('⚠️ Not Found', 'This scheme is not registered in our system', [
        { text: 'Scan Again', onPress: () => { setModalVisible(false); setScanned(false); } }
      ]);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>📱 Scan Scheme QR</Text>
        <Text style={[styles.headerSub, { color: colors.textSecondary }]}>Scan QR code on scheme documents to verify authenticity</Text>
      </View>

      <View style={styles.cameraContainer}>
        <Camera
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={styles.camera}
          barcodeTypes={['qr']}
        />
        <View style={styles.overlay}>
          <View style={styles.scanArea}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
        </View>
      </View>

      <View style={[styles.instructions, { backgroundColor: colors.card }]}>
        <Text style={[styles.instructionTitle, { color: colors.text }]}>How to use:</Text>
        <Text style={[styles.instructionText, { color: colors.textSecondary }]}>1. Point camera at scheme QR code</Text>
        <Text style={[styles.instructionText, { color: colors.textSecondary }]}>2. Hold steady for 1-2 seconds</Text>
        <Text style={[styles.instructionText, { color: colors.textSecondary }]}>3. System will verify the scheme</Text>
      </View>

      <TouchableOpacity style={styles.galleryBtn} onPress={async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
          allowsEditing: true,
          barcodeScanner: true,
        });
        if (!result.canceled && result.assets[0]) {
          Alert.alert('Gallery', 'Please use camera for QR scanning');
        }
      }}>
        <Text style={styles.galleryBtnText}>📷 Scan from Gallery</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>QR Code Detected</Text>
            {resultData && (
              <View style={styles.resultBox}>
                <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>Scheme ID:</Text>
                <Text style={[styles.resultValue, { color: colors.text }]}>{resultData.id || 'N/A'}</Text>
                <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>Type:</Text>
                <Text style={[styles.resultValue, { color: colors.text }]}>{resultData.type || 'Scheme Document'}</Text>
              </View>
            )}
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => { setModalVisible(false); setScanned(false); }}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.verifyBtn} onPress={verifyWithBackend}>
                <Text style={styles.verifyBtnText}>Verify</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  headerSub: { fontSize: 13, marginTop: 5, textAlign: 'center' },
  cameraContainer: { flex: 1, margin: 15, borderRadius: 15, overflow: 'hidden' },
  camera: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  scanArea: { width: 250, height: 250, position: 'relative' },
  corner: { position: 'absolute', width: 40, height: 40, borderColor: '#3498db' },
  topLeft: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4 },
  topRight: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4 },
  bottomLeft: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4 },
  bottomRight: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4 },
  instructions: { margin: 15, padding: 15, borderRadius: 10 },
  instructionTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 8 },
  instructionText: { fontSize: 13, marginBottom: 4 },
  galleryBtn: { backgroundColor: '#3498db', marginHorizontal: 15, marginBottom: 30, padding: 15, borderRadius: 10, alignItems: 'center' },
  galleryBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { borderRadius: 15, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  resultBox: { backgroundColor: '#f8f9fa', padding: 15, borderRadius: 10, marginBottom: 15 },
  resultLabel: { fontSize: 11, marginBottom: 2 },
  resultValue: { fontSize: 15, fontWeight: 'bold', marginBottom: 10 },
  modalBtns: { flexDirection: 'row', gap: 10 },
  cancelBtn: { flex: 1, padding: 12, borderRadius: 8, backgroundColor: '#95a5a6', alignItems: 'center' },
  cancelBtnText: { color: '#fff', fontWeight: 'bold' },
  verifyBtn: { flex: 1, padding: 12, borderRadius: 8, backgroundColor: '#27ae60', alignItems: 'center' },
  verifyBtnText: { color: '#fff', fontWeight: 'bold' },
});

export default QRCodeScannerScreen;