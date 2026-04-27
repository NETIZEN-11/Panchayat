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
  Linking,
} from 'react-native';
import { SchemeContext } from '../context/SchemeContext';
import { getImageBaseUrl } from '../config/api';

const SchemeDetailScreen = ({ route }) => {
  const { id } = route.params;
  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const { getSchemeById } = useContext(SchemeContext);

  useEffect(() => {
    fetchScheme();
  }, []);

  const fetchScheme = async () => {
    try {
      const response = await getSchemeById(id);
      setScheme(response.scheme);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch scheme');
    } finally {
      setLoading(false);
    }
  };

  const handleCall = (phone) => {
    Linking.openURL(`tel:${phone}`);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  if (!scheme) {
    return (
      <View style={styles.centerContainer}>
        <Text>Scheme not found</Text>
      </View>
    );
  }

  const imgBaseUrl = getImageBaseUrl();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {scheme.image && (
          <Image
            source={{ uri: `${imgBaseUrl}${scheme.image}` }}
            style={styles.image}
          />
        )}

        <View style={styles.header}>
          <Text style={styles.title}>{scheme.name}</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{scheme.category}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <Text style={styles.description}>{scheme.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Eligibility Criteria</Text>
          <Text style={styles.text}>{scheme.eligibility}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Benefits</Text>
          <Text style={styles.text}>{scheme.benefits}</Text>
        </View>

        {scheme.applicationDeadline && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Application Deadline</Text>
            <Text style={styles.deadline}>
              {new Date(scheme.applicationDeadline).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          {scheme.contactPerson && (
            <View style={styles.contactRow}>
              <Text style={styles.label}>Contact Person:</Text>
              <Text style={styles.value}>{scheme.contactPerson}</Text>
            </View>
          )}
          {scheme.contactPhone && (
            <TouchableOpacity
              style={styles.contactRow}
              onPress={() => handleCall(scheme.contactPhone)}
            >
              <Text style={styles.label}>Phone:</Text>
              <Text style={[styles.value, styles.phoneLink]}>{scheme.contactPhone}</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Posted By</Text>
          <Text style={styles.text}>{scheme.createdBy?.name}</Text>
          <Text style={styles.subtext}>{scheme.createdBy?.email}</Text>
        </View>
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
    paddingBottom: 20,
  },
  image: {
    width: '100%',
    height: 200,
  },
  header: {
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  categoryBadge: {
    backgroundColor: '#27ae60',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  categoryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: '#fff',
    margin: 15,
    marginBottom: 10,
    borderRadius: 12,
    padding: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#3498db',
    paddingBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
  },
  text: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
  },
  subtext: {
    fontSize: 12,
    color: '#95a5a6',
    marginTop: 5,
  },
  deadline: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  label: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  value: {
    fontSize: 13,
    color: '#7f8c8d',
    flex: 1,
    textAlign: 'right',
  },
  phoneLink: {
    color: '#3498db',
    textDecorationLine: 'underline',
  },
});

export default SchemeDetailScreen;
