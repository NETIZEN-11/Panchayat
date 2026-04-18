import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  Image,
  Dimensions
} from 'react-native';
import { ComplaintContext } from '../context/ComplaintContext';
import { LanguageContext } from '../context/LanguageContext';
import HistoryTimeline from '../components/HistoryTimeline';
import { getImageBaseUrl } from '../config/api';

const { width } = Dimensions.get('window');

const ComplaintDetailScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const { t } = useContext(LanguageContext);
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const { getComplaintById, deleteComplaint } = useContext(ComplaintContext);

  useEffect(() => {
    fetchComplaint();
  }, []);

  const fetchComplaint = async () => {
    try {
      const response = await getComplaintById(id);
      setComplaint(response.complaint);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch complaint');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      t('delete_complaint') || 'Delete Complaint',
      'Are you sure you want to delete this complaint?',
      [
        { text: 'Cancel', onPress: () => {} },
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
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return '#f39c12';
      case 'In Progress':
        return '#3498db';
      case 'Resolved':
        return '#27ae60';
      case 'Rejected':
        return '#e74c3c';
      default:
        return '#95a5a6';
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  if (!complaint) {
    return (
      <View style={styles.centerContainer}>
        <Text>Complaint not found</Text>
      </View>
    );
  }

  const images = complaint.images || (complaint.image ? [complaint.image] : []);
  const imgBaseUrl = getImageBaseUrl();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{complaint.title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(complaint.status) }]}>
            <Text style={styles.statusText}>{t(complaint.status.toLowerCase().replace(' ', '_')) || complaint.status}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('details') || 'Details'}</Text>

          <View style={styles.detailRow}>
            <Text style={styles.labelTitle}>{t('category')}:</Text>
            <Text style={styles.value}>{complaint.category}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.labelTitle}>{t('location')}:</Text>
            <Text style={styles.value}>{complaint.location}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.labelTitle}>Priority:</Text>
            <Text style={styles.value}>{complaint.priority}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.labelTitle}>Filed On:</Text>
            <Text style={styles.value}>{new Date(complaint.createdAt).toLocaleString()}</Text>
          </View>

          <Text style={styles.labelTitle}>{t('description')}</Text>
          <Text style={styles.descriptionText}>{complaint.description}</Text>

          {images.length > 0 && (
            <>
              <Text style={styles.labelTitle}>{t('images') || 'Images'}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
                {images.map((img, index) => (
                  <Image
                    key={index}
                    source={{ uri: `${imgBaseUrl}${img}` }}
                    style={styles.detailImage}
                  />
                ))}
              </ScrollView>
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('timeline')}</Text>
          <HistoryTimeline timeline={complaint.timeline} />
        </View>

        {complaint.adminNotes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Admin Notes</Text>
            <Text style={styles.adminNotesText}>{complaint.adminNotes}</Text>
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 10,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#3498db',
    paddingBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  labelTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 12,
    marginBottom: 5,
  },
  value: {
    fontSize: 14,
    color: '#7f8c8d',
    flex: 1,
    textAlign: 'right',
  },
  descriptionText: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 6,
  },
  adminNotesText: {
    fontSize: 13,
    color: '#27ae60',
    lineHeight: 18,
    backgroundColor: '#f0fdf4',
    padding: 10,
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#27ae60',
  },
  imageScroll: {
    marginTop: 10,
  },
  detailImage: {
    width: width - 80,
    height: 200,
    borderRadius: 8,
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ComplaintDetailScreen;
