import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Linking,
  Alert
} from 'react-native';
import api from '../config/api';

const DirectoryScreen = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', 'doctor', 'teacher', 'shop', 'worker', 'electrician', 'plumber', 'other'];

  useEffect(() => {
    fetchEntries();
  }, [selectedCategory]);

  const fetchEntries = async () => {
    try {
      const params = selectedCategory !== 'all' ? `?category=${selectedCategory}` : '';
      const response = await api.get(`/directory${params}`);
      setEntries(response.data.data || []);
    } catch (error) {
      console.error('Error fetching directory:', error);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const makeCall = (phone) => {
    Alert.alert(
      'Make Call',
      `Call ${phone}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => Linking.openURL(`tel:${phone}`) }
      ]
    );
  };

  const filteredEntries = entries.filter(entry =>
    entry.name?.toLowerCase().includes(search.toLowerCase())
  );

  const renderEntry = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.name}>{item.name}</Text>
        <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.category) }]}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
      </View>

      {item.specialization && (
        <Text style={styles.specialization}>{item.specialization}</Text>
      )}

      {item.address && (
        <Text style={styles.info}>Address: {item.address}</Text>
      )}

      {item.availability && (
        <Text style={styles.info}>Availability: {item.availability}</Text>
      )}

      <TouchableOpacity
        style={styles.callButton}
        onPress={() => makeCall(item.phone)}
      >
        <Text style={styles.callButtonText}>Call: {item.phone}</Text>
      </TouchableOpacity>
    </View>
  );

  const getCategoryColor = (category) => {
    const colors = {
      doctor: '#e74c3c',
      teacher: '#3498db',
      shop: '#f39c12',
      worker: '#9b59b6',
      electrician: '#e67e22',
      plumber: '#1abc9c',
      other: '#95a5a6'
    };
    return colors[category] || '#95a5a6';
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.categoryContainer}>
        <FlatList
          horizontal
          data={categories}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryButton,
                selectedCategory === item && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory(item)}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  selectedCategory === item && styles.categoryButtonTextActive
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        data={filteredEntries}
        renderItem={renderEntry}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No entries found</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    padding: 15,
    backgroundColor: '#fff',
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  categoryContainer: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  categoryButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#ecf0f1',
    marginRight: 10,
  },
  categoryButtonActive: {
    backgroundColor: '#3498db',
  },
  categoryButtonText: {
    color: '#7f8c8d',
    textTransform: 'capitalize',
  },
  categoryButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  list: {
    padding: 15,
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  specialization: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  info: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  callButton: {
    backgroundColor: '#27ae60',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  callButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  empty: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#95a5a6',
  },
});

export default DirectoryScreen;
