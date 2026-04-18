import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, ScrollView, Image, Modal, Dimensions,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { ComplaintContext } from '../context/ComplaintContext';
import { AuthContext } from '../context/AuthContext';
import HistoryTimeline from '../components/HistoryTimeline';
import { getImageBaseUrl } from '../config/api';

const { width } = Dimensions.get('window');

const STATUS_COLORS = {
  Pending: '#e74c3c', 'In Progress': '#f39c12', Resolved: '#27ae60', Rejected: '#95a5a6',
};

const AdminComplaintDetailScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const { user } = useContext(AuthContext);
  const [complaint, setComplaint] = useState(null);
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { getComplaintById, updateComplaintStatus } = useContext(ComplaintContext);

  useEffect(() => { fetchComplaint(); }, []);

  const fetchComplaint = async () => {
    try {
      const response = await getComplaintById(id);
      const c = response.complaint;
      setComplaint(c);
      setStatus(c.status);
      setPriority(c.priority || 'Medium');
      setAdminNotes(c.adminNotes || '');
      setAssignedTo(c.assignedTo || '');
    } catch {
      Alert.alert('Error', 'Failed to fetch complaint');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      setUpdating(true);
      await updateComplaintStatus(id, { status, priority, adminNotes, assignedTo });
      Alert.alert('Updated', 'Complaint updated successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color="#3498db" /></View>;
  }

  if (!complaint) {
    return <View style={styles.centered}><Text>Complaint not found</Text></View>;
  }

  const images = complaint.images || (complaint.image ? [complaint.image] : []);
  const imgBaseUrl = getImageBaseUrl();

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      {/* Status Header */}
      <View style={[styles.statusHeader, { backgroundColor: STATUS_COLORS[complaint.status] || '#95a5a6' }]}>
        <Text style={styles.statusHeaderText}>{complaint.status}</Text>
        {complaint.isEscalated && (
          <View style={styles.escalatedTag}>
            <Text style={styles.escalatedTagText}>ESCALATED</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        {/* Complaint Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>COMPLAINT DETAILS</Text>

          <Text style={styles.label}>Title</Text>
          <Text style={styles.valueText}>{complaint.title}</Text>

          <Text style={styles.label}>Description</Text>
          <Text style={styles.valueText}>{complaint.description}</Text>

          {complaint.otherDetails ? (
            <>
              <Text style={styles.label}>Additional Details (Other Category)</Text>
              <Text style={styles.valueText}>{complaint.otherDetails}</Text>
            </>
          ) : null}

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.label}>Category</Text>
              <View style={styles.tagBox}>
                <Text style={styles.tagText}>{complaint.category}</Text>
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Priority</Text>
              <View style={[styles.tagBox, {
                backgroundColor: complaint.priority === 'Urgent' ? '#e74c3c' : complaint.priority === 'High' ? '#f39c12' : '#3498db'
              }]}>
                <Text style={[styles.tagText, { color: '#fff' }]}>{complaint.priority}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.label}>Location</Text>
          <Text style={styles.valueText}>{complaint.location}</Text>

          <Text style={styles.label}>Village / District</Text>
          <Text style={styles.valueText}>{complaint.village} — {complaint.district}</Text>

          <Text style={styles.label}>Filed By</Text>
          <Text style={styles.valueText}>{complaint.userId?.name} ({complaint.userId?.phone || 'N/A'})</Text>

          <Text style={styles.label}>Date Submitted</Text>
          <Text style={styles.valueText}>{new Date(complaint.createdAt).toLocaleString('en-IN')}</Text>

          {complaint.assignedTo ? (
            <>
              <Text style={styles.label}>Currently Assigned To</Text>
              <Text style={styles.valueText}>{complaint.assignedTo}</Text>
            </>
          ) : null}
        </View>

        {/* Images */}
        {images.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PHOTO EVIDENCE</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {images.map((img, index) => (
                <Image
                  key={index}
                  source={{ uri: `${imgBaseUrl}${img}` }}
                  style={styles.detailImage}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>STATUS TIMELINE</Text>
          <HistoryTimeline timeline={complaint.timeline} />
        </View>

        {/* Update Panel */}
        <View style={[styles.section, styles.updateSection]}>
          <Text style={styles.sectionTitle}>UPDATE COMPLAINT</Text>

          <Text style={styles.label}>Change Status</Text>
          <View style={styles.pickerContainer}>
            <Picker selectedValue={status} onValueChange={setStatus} enabled={!updating}>
              <Picker.Item label="Pending" value="Pending" />
              <Picker.Item label="In Progress" value="In Progress" />
              <Picker.Item label="Resolved" value="Resolved" />
              <Picker.Item label="Rejected" value="Rejected" />
            </Picker>
          </View>

          <Text style={styles.label}>Set Priority</Text>
          <View style={styles.pickerContainer}>
            <Picker selectedValue={priority} onValueChange={setPriority} enabled={!updating}>
              <Picker.Item label="Low" value="Low" />
              <Picker.Item label="Medium" value="Medium" />
              <Picker.Item label="High" value="High" />
              <Picker.Item label="Urgent" value="Urgent" />
            </Picker>
          </View>

          <Text style={styles.label}>Assign Worker / Department</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Road Department, Ram Kumar..."
            value={assignedTo}
            onChangeText={setAssignedTo}
            editable={!updating}
          />

          <Text style={styles.label}>Remarks / Admin Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Add official remarks about this complaint update..."
            value={adminNotes}
            onChangeText={setAdminNotes}
            multiline
            numberOfLines={4}
            editable={!updating}
          />

          <TouchableOpacity
            style={[styles.updateBtn, updating && styles.btnDisabled]}
            onPress={handleUpdate}
            disabled={updating}
          >
            {updating
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.updateBtnText}>SAVE UPDATE</Text>
            }
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  statusHeader: { padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  statusHeaderText: { color: '#fff', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
  escalatedTag: {
    backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 3, borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)',
  },
  escalatedTagText: { color: '#fff', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },

  content: { padding: 15 },
  row: { flexDirection: 'row', marginTop: 4 },
  section: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 15,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 3,
  },
  updateSection: { borderTopWidth: 4, borderTopColor: '#3498db' },
  sectionTitle: { fontSize: 11, fontWeight: '800', color: '#95a5a6', marginBottom: 14, letterSpacing: 1.5 },

  label: { fontSize: 12, fontWeight: '700', color: '#7f8c8d', marginTop: 12, marginBottom: 4 },
  valueText: {
    fontSize: 14, color: '#2c3e50', backgroundColor: '#f8f9fa',
    padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#ecf0f1',
  },
  tagBox: {
    backgroundColor: '#3498db', borderRadius: 8, paddingHorizontal: 12,
    paddingVertical: 6, alignSelf: 'flex-start',
  },
  tagText: { color: '#fff', fontSize: 13, fontWeight: 'bold' },

  detailImage: {
    width: width - 80, height: 200, borderRadius: 10, marginRight: 10,
  },

  pickerContainer: {
    backgroundColor: '#f8f9fa', borderRadius: 8,
    borderWidth: 1, borderColor: '#ecf0f1', overflow: 'hidden', marginBottom: 6,
  },
  input: {
    backgroundColor: '#f8f9fa', borderRadius: 8, padding: 13,
    borderWidth: 1, borderColor: '#ecf0f1', fontSize: 14, color: '#2c3e50',
  },
  textArea: { height: 100, textAlignVertical: 'top', marginTop: 4 },

  updateBtn: {
    backgroundColor: '#3498db', borderRadius: 10, padding: 16,
    alignItems: 'center', marginTop: 16,
  },
  btnDisabled: { opacity: 0.6 },
  updateBtnText: { color: '#fff', fontSize: 14, fontWeight: 'bold', letterSpacing: 1 },
});

export default AdminComplaintDetailScreen;
