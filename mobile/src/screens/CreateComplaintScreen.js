import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  Modal,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { ComplaintContext } from '../context/ComplaintContext';

const CATEGORIES = ['Road', 'Water', 'Electricity', 'Sanitation', 'Health', 'Education', 'Other'];

const CreateComplaintScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Road');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const { createComplaint } = useContext(ComplaintContext);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setLatitude(loc.coords.latitude);
      setLongitude(loc.coords.longitude);

      const address = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      if (address.length > 0) {
        setLocation(address[0].name || 'Current Location');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to get location');
    }
  };

  const handleSubmit = async () => {
    if (!title || !description || !category || !location) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      await createComplaint({
        title,
        description,
        category,
        location,
        latitude,
        longitude,
        image,
      });

      Alert.alert('Success', 'Complaint filed successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create complaint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.label}>Title *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter complaint title"
          value={title}
          onChangeText={setTitle}
          editable={!loading}
        />

        <Text style={styles.label}>Description *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe the issue in detail"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          editable={!loading}
        />

        <Text style={styles.label}>Category *</Text>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setShowCategoryModal(true)}
          disabled={loading}
        >
          <Text style={styles.dropdownText}>{category}</Text>
          <Text style={styles.dropdownArrow}>▼</Text>
        </TouchableOpacity>

        <Modal
          visible={showCategoryModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowCategoryModal(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowCategoryModal(false)}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Category</Text>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.optionItem,
                    category === cat && styles.optionItemSelected
                  ]}
                  onPress={() => {
                    setCategory(cat);
                    setShowCategoryModal(false);
                  }}
                >
                  <Text style={[
                    styles.optionText,
                    category === cat && styles.optionTextSelected
                  ]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>

        <Text style={styles.label}>Location *</Text>
        <View style={styles.locationContainer}>
          <TextInput
            style={[styles.input, styles.locationInput]}
            placeholder="Enter location"
            value={location}
            onChangeText={setLocation}
            editable={!loading}
          />
          <TouchableOpacity
            style={styles.locationButton}
            onPress={getLocation}
            disabled={loading}
          >
            <Text style={styles.locationButtonText}>L</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Image</Text>
        <TouchableOpacity
          style={styles.imageButton}
          onPress={pickImage}
          disabled={loading}
        >
          <Text style={styles.imageButtonText}>
            {image ? 'Image Selected' : 'Pick Image'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>File Complaint</Text>
          )}
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
  content: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ecf0f1',
    fontSize: 14,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ecf0f1',
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 14,
    color: '#2c3e50',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
    textAlign: 'center',
  },
  optionItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  optionItemSelected: {
    backgroundColor: '#e8f4f8',
  },
  optionText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  optionTextSelected: {
    color: '#3498db',
    fontWeight: 'bold',
  },
  locationContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  locationInput: {
    flex: 1,
  },
  locationButton: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
  },
  locationButtonText: {
    fontSize: 20,
  },
  imageButton: {
    backgroundColor: '#95a5a6',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  imageButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#27ae60',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CreateComplaintScreen;
/ /   E m o j i   r e m o v a l   -   C o m m i t   2 5  
 / /   F i n a l   e m o j i   r e m o v a l   p a s s   -   C o m m i t   3 9  
 