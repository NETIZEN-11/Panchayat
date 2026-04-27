import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator,
  Alert, ScrollView, Image, Dimensions, Modal, TextInput,
} from 'react-native';
import { ComplaintContext } from '../context/ComplaintContext';
import { LanguageContext } from '../context/LanguageContext';
import { ThemeContext } from '../context/ThemeContext';
import api from '../config/api';
import HistoryTimeline from '../components/HistoryTimeline';
import { getImageBaseUrl } from '../config/api';

const { width, height } = Dimensions.get('window');

const ComplaintDetailScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const { t } = useContext(LanguageContext);
  const { colors } = useContext(ThemeContext);
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [rating, setRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const { getComplaintById, deleteComplaint } = useContext(ComplaintContext);

  useEffect(() => { fetchComplaint(); }, []);

  const fetchComplaint = async () => {
    try {
      const response = await getComplaintById(id);
      setComplaint(response.complaint);
    } catch {
      Alert.alert('Error', 'Failed to fetch complaint');
      navigation.goBack();
    } finally { setLoading(false); }
  };

  const handleDelete = () => {
    Alert.alert('Delete Complaint', 'Are you sure you want to delete this complaint?', [
      { text: 'Cancel' },
      {
        text: 'Delete',
        onPress: async () => {
          try {
            setDeleting(true);
            await deleteComplaint(id);
            Alert.alert('Success', 'Complaint deleted successfully');
            navigation.goBack();
          } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to delete complaint');
          } finally { setDeleting(false); }
        },
      },
    ]);
  };

  const submitRating = async () => {
    if (rating === 0) { Alert.alert('Error', 'Please select a star rating'); return; }
    setSubmittingRating(true);
    try {
      await api.post('/feedback', { rating, comment: ratingComment, type: 'complaint', complaintId: id });
      Alert.alert('Success', 'Thank you for your feedback!');
      setRating(0); setRatingComment('');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to submit rating');
    } finally { setSubmittingRating(false); }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return '#f39c12'; case 'In Progress': return '#3498db';
      case 'Resolved': return '#27ae60'; case 'Rejected': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const StarRating = ({ value, onChange, size = 32, readonly = false }) => (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map(star => (
        <TouchableOpacity key={star} onPress={() => !readonly && onChange(star)} disabled={readonly}>
          <Text style={{ fontSize: size, color: star <= value ? '#f39c12' : colors.border }}>
            {star <= value ? '★' : '☆'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  if (loading) {
    return <View style={[styles.centerContainer, { backgroundColor: colors.background }]}><ActivityIndicator size="large" color="#3498db" /></View>;
  }
  if (!complaint) {
    return <View style={[styles.centerContainer, { backgroundColor: colors.background }]}><Text style={{ color: colors.text }}>Complaint not found</Text></View>;
  }

  const images = complaint.images || (complaint.image ? [complaint.image] : []);
  const imgBaseUrl = getImageBaseUrl();
  const isResolved = complaint.status === 'Resolved';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>{complaint.title}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(complaint.status) }]}>
              <Text style={styles.statusText}>{complaint.status}</Text>
            </View>
          </View>

          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Details</Text>
            <View style={[styles.detailRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.labelTitle, { color: colors.text }]}>Category:</Text>
              <Text style={[styles.value, { color: colors.textSecondary }]}>{complaint.category}</Text>
            </View>
            <View style={[styles.detailRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.labelTitle, { color: colors.text }]}>Location:</Text>
              <Text style={[styles.value, { color: colors.textSecondary }]}>{complaint.location}</Text>
            </View>
            <View style={[styles.detailRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.labelTitle, { color: colors.text }]}>Priority:</Text>
              <Text style={[styles.value, { color: colors.textSecondary }]}>{complaint.priority}</Text>
            </View>
            <View style={[styles.detailRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.labelTitle, { color: colors.text }]}>Filed On:</Text>
              <Text style={[styles.value, { color: colors.textSecondary }]}>{new Date(complaint.createdAt).toLocaleString()}</Text>
            </View>
            <Text style={[styles.labelTitle, { color: colors.text }]}>Description</Text>
            <Text style={[styles.descriptionText, { backgroundColor: colors.inputBg, color: colors.textSecondary }]}>{complaint.description}</Text>

            {images.length > 0 && (
              <>
                <Text style={[styles.labelTitle, { color: colors.text }]}>Photo Evidence</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
                  {images.map((img, index) => (
                    <TouchableOpacity key={index} onPress={() => { setSelectedImage(`${imgBaseUrl}${img}`); setShowImageModal(true); }}>
                      <Image source={{ uri: `${imgBaseUrl}${img}` }} style={styles.detailImage} />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}
          </View>

          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Timeline</Text>
            <HistoryTimeline timeline={complaint.timeline} />
          </View>

          {complaint.adminNotes && (
            <View style={[styles.section, { backgroundColor: colors.surface }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Admin Notes</Text>
              <Text style={styles.adminNotesText}>{complaint.adminNotes}</Text>
            </View>
          )}

          {isResolved && (
            <View style={[styles.section, { backgroundColor: colors.surface }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Rate Resolution</Text>
              <Text style={[styles.ratingSubtitle, { color: colors.textSecondary }]}>How satisfied are you with the resolution?</Text>
              <StarRating value={rating} onChange={setRating} />
              <TextInput
                style={[styles.input, { marginTop: 12, backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
                placeholder="Write a review (optional)..."
                placeholderTextColor={colors.textSecondary}
                value={ratingComment}
                onChangeText={setRatingComment}
                multiline
                numberOfLines={3}
              />
              <TouchableOpacity
                style={[styles.submitRatingBtn, submittingRating && styles.submitRatingBtnDisabled]}
                onPress={submitRating}
                disabled={submittingRating}
              >
                {submittingRating ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitRatingBtnText}>Submit Feedback</Text>}
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            style={[styles.deleteButton, deleting && styles.buttonDisabled]}
            onPress={handleDelete}
            disabled={deleting}
          >
            <Text style={styles.deleteButtonText}>Delete Complaint</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={showImageModal} transparent animationType="fade" onRequestClose={() => setShowImageModal(false)}>
        <View style={styles.imageModalOverlay}>
          <TouchableOpacity style={styles.imageModalClose} onPress={() => setShowImageModal(false)}>
            <Text style={styles.imageModalCloseText}>X</Text>
          </TouchableOpacity>
          {selectedImage && <Image source={{ uri: selectedImage }} style={styles.imageModalContent} resizeMode="contain" />}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 15 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 },
  title: { fontSize: 22, fontWeight: 'bold', flex: 1 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginLeft: 10 },
  statusText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  section: { borderRadius: 12, padding: 15, marginBottom: 15, elevation: 3 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, borderBottomWidth: 2, borderBottomColor: '#3498db', paddingBottom: 10 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1 },
  labelTitle: { fontSize: 13, fontWeight: 'bold', marginTop: 12, marginBottom: 5 },
  value: { fontSize: 14, flex: 1, textAlign: 'right' },
  descriptionText: { fontSize: 14, lineHeight: 20, padding: 10, borderRadius: 6 },
  adminNotesText: { fontSize: 13, color: '#27ae60', lineHeight: 18, backgroundColor: '#f0fdf4', padding: 10, borderRadius: 6, borderLeftWidth: 4, borderLeftColor: '#27ae60' },
  imageScroll: { marginTop: 10 },
  detailImage: { width: 140, height: 100, borderRadius: 8, marginRight: 10 },
  deleteButton: { backgroundColor: '#e74c3c', borderRadius: 8, padding: 15, alignItems: 'center', marginBottom: 20 },
  buttonDisabled: { opacity: 0.6 },
  deleteButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  ratingSubtitle: { fontSize: 14, marginBottom: 12, marginTop: 4 },
  starsRow: { flexDirection: 'row', gap: 8 },
  input: { borderRadius: 8, borderWidth: 1, padding: 12, fontSize: 14, textAlignVertical: 'top' },
  submitRatingBtn: { backgroundColor: '#27ae60', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 12 },
  submitRatingBtnDisabled: { opacity: 0.6 },
  submitRatingBtnText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  imageModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  imageModalClose: { position: 'absolute', top: 50, right: 20, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 20, width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  imageModalCloseText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  imageModalContent: { width: width - 40, height: height * 0.7 },
});

export default ComplaintDetailScreen;
