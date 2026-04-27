import React, { useState, useContext } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  Alert, ActivityIndicator, Image, Modal, Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { LanguageContext } from '../context/LanguageContext';
import { ComplaintContext } from '../context/ComplaintContext';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

const CATEGORIES = [
  { value: 'Road', label: 'Road', desc: 'Potholes, broken roads, missing speed breakers' },
  { value: 'Water', label: 'Water Supply', desc: 'No water supply, contamination, pipe leakage' },
  { value: 'Electricity', label: 'Electricity', desc: 'Power cuts, streetlight issues, transformer faults' },
  { value: 'Sanitation', label: 'Sanitation', desc: 'Garbage collection, public toilets, cleanliness' },
  { value: 'Health', label: 'Health', desc: 'Health center issues, vaccine availability' },
  { value: 'Education', label: 'Education', desc: 'School infrastructure, teacher absence, books' },
  { value: 'Drainage', label: 'Drainage', desc: 'Blocked drains, waterlogging, flooding' },
  { value: 'Street Light', label: 'Street Light', desc: 'Dark streets, broken lights, safety concern' },
  { value: 'Public Property', label: 'Public Property', desc: 'Damage to parks, public buildings, monuments' },
  { value: 'Pollution', label: 'Pollution', desc: 'Air, water or noise pollution in the village' },
  { value: 'Animal Nuisance', label: 'Animal Issue', desc: 'Stray animals, cattle on roads' },
  { value: 'Encroachment', label: 'Encroachment', desc: 'Illegal construction, road encroachment' },
  { value: 'Government Services', label: 'Govt Services', desc: 'Ration card, certificate, pension delays' },
  { value: 'Other', label: 'Other', desc: 'Any other village problem not listed above' },
];

const CATEGORY_COLORS = {
  Road: '#e74c3c', 'Water Supply': '#3498db', Electricity: '#f39c12',
  Sanitation: '#27ae60', Health: '#e91e63', Education: '#9b59b6',
  Drainage: '#00bcd4', 'Street Light': '#ff9800', 'Public Property': '#607d8b',
  Pollution: '#795548', 'Animal Issue': '#4caf50', Encroachment: '#f44336',
  'Govt Services': '#2196f3', Other: '#95a5a6',
};

export default function NewComplaintScreen({ navigation }) {
  const { t } = useContext(LanguageContext);
  const { createComplaint } = useContext(ComplaintContext);
  const { user } = useContext(AuthContext);
  const { colors } = useContext(ThemeContext);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Road');
  const [otherDetails, setOtherDetails] = useState('');
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const selectedCategory = CATEGORIES.find(c => c.value === category);
  const selectedColor = CATEGORY_COLORS[selectedCategory?.label] || '#3498db';

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission Required', 'Please allow access to your photo library.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsMultipleSelection: true, quality: 0.7 });
    if (!result.canceled && result.assets) setImages([...images, ...result.assets].slice(0, 5));
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission Required', 'Please allow camera access.'); return; }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!result.canceled && result.assets) setImages([...images, ...result.assets].slice(0, 5));
  };

  const getLocation = async () => {
    try {
      setLocationLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { Alert.alert('Permission Denied', 'Location permission is required.'); return; }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setLatitude(loc.coords.latitude);
      setLongitude(loc.coords.longitude);
      const geocode = await Location.reverseGeocodeAsync({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      if (geocode.length > 0) {
        const g = geocode[0];
        const parts = [g.street, g.district, g.city, g.region].filter(Boolean);
        setLocation(parts.join(', ') || `${loc.coords.latitude.toFixed(4)}, ${loc.coords.longitude.toFixed(4)}`);
      } else {
        setLocation(`${loc.coords.latitude.toFixed(4)}, ${loc.coords.longitude.toFixed(4)}`);
      }
    } catch { Alert.alert('Error', 'Could not get location. Please enter manually.'); }
    finally { setLocationLoading(false); }
  };

  const handleSubmit = async () => {
    if (!title.trim()) { Alert.alert('Error', 'Please enter a title'); return; }
    if (!description.trim()) { Alert.alert('Error', 'Please enter a description'); return; }
    if (!location.trim()) { Alert.alert('Error', 'Please provide a location'); return; }
    if (category === 'Other' && !otherDetails.trim()) { Alert.alert('Error', 'Please describe the Other issue'); return; }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('category', category);
      formData.append('otherDetails', category === 'Other' ? otherDetails.trim() : '');
      formData.append('location', location.trim());
      if (latitude) formData.append('latitude', latitude.toString());
      if (longitude) formData.append('longitude', longitude.toString());
      images.forEach((img, i) => {
        formData.append('images', { uri: img.uri, type: 'image/jpeg', name: `image_${i}.jpg` });
      });
      await createComplaint(formData);
      Alert.alert('Success', 'Your complaint has been submitted!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to submit complaint');
    } finally { setLoading(false); }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} keyboardShouldPersistTaps="handled">
      {/* Category Selector */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>CATEGORY *</Text>
        <TouchableOpacity style={[styles.categoryBtn, { borderColor: selectedColor, backgroundColor: colors.inputBg }]} onPress={() => setShowCategoryModal(true)}>
          <View style={[styles.categoryDot, { backgroundColor: selectedColor }]} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.categoryBtnText, { color: selectedColor }]}>{selectedCategory?.label}</Text>
            <Text style={[styles.categoryBtnDesc, { color: colors.textSecondary }]} numberOfLines={1}>{selectedCategory?.desc}</Text>
          </View>
          <Text style={[styles.categoryArrow, { color: selectedColor }]}>Change</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showCategoryModal} transparent animationType="slide" onRequestClose={() => setShowCategoryModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Select Category</Text>
            <ScrollView>
              {CATEGORIES.map(cat => {
                const catColor = CATEGORY_COLORS[cat.label] || '#95a5a6';
                return (
                  <TouchableOpacity
                    key={cat.value}
                    style={[styles.catOption, { borderBottomColor: colors.border }, category === cat.value && { backgroundColor: catColor + '15' }]}
                    onPress={() => { setCategory(cat.value); setShowCategoryModal(false); }}
                  >
                    <View style={[styles.catDot, { backgroundColor: catColor }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.catOptionText, { color: colors.text }, category === cat.value && { color: catColor }]}>{cat.label}</Text>
                      <Text style={[styles.catOptionDesc, { color: colors.textSecondary }]} numberOfLines={1}>{cat.desc}</Text>
                    </View>
                    {category === cat.value && <View style={[styles.catCheck, { backgroundColor: catColor }]}><Text style={styles.catCheckText}>ON</Text></View>}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <TouchableOpacity style={[styles.modalClose, { backgroundColor: selectedColor }]} onPress={() => setShowCategoryModal(false)}>
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {category === 'Other' && (
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>DESCRIBE THE ISSUE *</Text>
          <TextInput
            style={[styles.input, styles.textArea, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
            placeholder="Please describe your specific village problem in detail..."
            placeholderTextColor={colors.textSecondary}
            value={otherDetails}
            onChangeText={setOtherDetails}
            multiline
            numberOfLines={4}
          />
        </View>
      )}

      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>TITLE *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
          placeholder="Short title (e.g. Road broken near school)"
          placeholderTextColor={colors.textSecondary}
          value={title}
          onChangeText={setTitle}
        />
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>DESCRIPTION *</Text>
        <TextInput
          style={[styles.input, styles.textArea, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
          placeholder="Describe the problem in detail..."
          placeholderTextColor={colors.textSecondary}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>LOCATION *</Text>
        <View style={styles.locationRow}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0, marginRight: 8, backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
            placeholder="Enter or auto-detect location"
            placeholderTextColor={colors.textSecondary}
            value={location}
            onChangeText={setLocation}
          />
          <TouchableOpacity style={styles.gpsBtn} onPress={getLocation} disabled={locationLoading}>
            {locationLoading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.gpsBtnText}>GPS</Text>}
          </TouchableOpacity>
        </View>
        {latitude && <Text style={styles.gpsCoords}>Detected: {latitude.toFixed(5)}, {longitude.toFixed(5)}</Text>}
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>PHOTO EVIDENCE (MAX 5)</Text>
        <View style={styles.imageButtons}>
          <TouchableOpacity style={[styles.imgBtn, { backgroundColor: colors.inputBg, borderColor: colors.border }]} onPress={takePhoto}>
            <Text style={[styles.imgBtnText, { color: colors.textSecondary }]}>Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.imgBtn, { backgroundColor: colors.inputBg, borderColor: colors.border }]} onPress={pickImages}>
            <Text style={[styles.imgBtnText, { color: colors.textSecondary }]}>Gallery</Text>
          </TouchableOpacity>
        </View>
        {images.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagePreview}>
            {images.map((img, i) => (
              <View key={i} style={styles.imgThumbWrap}>
                <Image source={{ uri: img.uri }} style={styles.imgThumb} />
                <TouchableOpacity style={styles.imgRemove} onPress={() => setImages(images.filter((_, j) => j !== i))}>
                  <Text style={styles.imgRemoveText}>X</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>VILLAGE</Text>
        <View style={[styles.villageDisplay, { borderColor: '#27ae60', backgroundColor: colors.inputBg }]}>
          <Text style={[styles.villageText, { color: '#27ae60' }]}>{user?.village || 'Loaded from your profile'}</Text>
          <Text style={[styles.villageNote, { color: colors.textSecondary }]}>Auto-filled from your account</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>SUBMIT COMPLAINT</Text>}
      </TouchableOpacity>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  section: { marginHorizontal: 15, marginTop: 12, borderRadius: 12, padding: 15, elevation: 2 },
  sectionTitle: { fontSize: 11, fontWeight: '800', marginBottom: 10, letterSpacing: 1.5 },
  input: { borderRadius: 8, padding: 13, borderWidth: 1, fontSize: 14 },
  textArea: { height: 100, textAlignVertical: 'top', marginTop: 4 },
  categoryBtn: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, borderWidth: 2, padding: 13 },
  categoryDot: { width: 14, height: 14, borderRadius: 7, marginRight: 12 },
  categoryBtnText: { fontSize: 16, fontWeight: '700' },
  categoryBtnDesc: { fontSize: 11, marginTop: 2 },
  categoryArrow: { fontSize: 12, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '80%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  catOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
  catDot: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  catOptionText: { fontSize: 15, fontWeight: '600' },
  catOptionDesc: { fontSize: 11, marginTop: 2 },
  catCheck: { borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  catCheckText: { fontSize: 10, color: '#fff', fontWeight: 'bold' },
  modalClose: { borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 15 },
  modalCloseText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  locationRow: { flexDirection: 'row', alignItems: 'center' },
  gpsBtn: { backgroundColor: '#3498db', borderRadius: 8, padding: 13, justifyContent: 'center', alignItems: 'center', minWidth: 60 },
  gpsBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  gpsCoords: { fontSize: 11, color: '#27ae60', marginTop: 6 },
  imageButtons: { flexDirection: 'row', gap: 10 },
  imgBtn: { flex: 1, borderRadius: 10, padding: 14, alignItems: 'center', borderWidth: 1, borderStyle: 'dashed' },
  imgBtnText: { fontSize: 14, fontWeight: '600' },
  imagePreview: { marginTop: 12 },
  imgThumbWrap: { position: 'relative', marginRight: 10 },
  imgThumb: { width: 80, height: 80, borderRadius: 8 },
  imgRemove: { position: 'absolute', top: -6, right: -6, backgroundColor: '#e74c3c', borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center' },
  imgRemoveText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  villageDisplay: { borderRadius: 8, borderWidth: 1, padding: 12 },
  villageText: { fontSize: 16, fontWeight: '700' },
  villageNote: { fontSize: 11, marginTop: 2 },
  submitBtn: { backgroundColor: '#27ae60', margin: 15, borderRadius: 12, padding: 18, alignItems: 'center', elevation: 4 },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold', letterSpacing: 1 },
});
