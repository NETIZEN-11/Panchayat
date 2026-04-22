import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import api from '../config/api';
import { AuthContext } from '../context/AuthContext';

const TYPE_COLORS = {
  complaint: '#e74c3c',
  announcement: '#9b59b6',
  scheme: '#27ae60',
  alert: '#f39c12',
  general: '#3498db',
};

const NotificationScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.data || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString('en-IN');
  };

  const renderNotification = ({ item }) => {
    const color = TYPE_COLORS[item.type] || TYPE_COLORS.general;

    return (
      <TouchableOpacity
        style={[styles.card, !item.isRead && styles.unreadCard]}
        onPress={() => {
          if (!item.isRead) markAsRead(item._id);
          // Navigate to related screen based on type
          if (item.type === 'complaint' && item.relatedId) {
            navigation.navigate('ComplaintDetail', { id: item.relatedId });
          } else if (item.type === 'announcement') {
            navigation.navigate('Announcements');
          }
        }}
      >
        {!item.isRead && <View style={[styles.unreadDot, { backgroundColor: color }]} />}

        <View style={styles.cardContent}>
          <View style={[styles.iconBox, { backgroundColor: color + '20' }]}>
            <Text style={[styles.iconText, { color }]}>
              {item.type === 'complaint' ? '!' :
               item.type === 'announcement' ? 'A' :
               item.type === 'scheme' ? 'S' :
               item.type === 'alert' ? 'AL' : 'N'}
            </Text>
          </View>

          <View style={styles.textContent}>
            <Text style={[styles.title, !item.isRead && styles.unreadTitle]}>{item.title}</Text>
            <Text style={styles.body} numberOfLines={2}>{item.body}</Text>
            <Text style={styles.time}>{getTimeAgo(item.createdAt)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
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
      {unreadCount > 0 && (
        <TouchableOpacity style={styles.markAllBtn} onPress={markAllAsRead}>
          <Text style={styles.markAllText}>Mark all as read ({unreadCount} unread)</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No notifications yet</Text>
            <Text style={styles.emptySubtext}>You'll see updates about complaints and announcements here</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  markAllBtn: {
    backgroundColor: '#fff', padding: 14, alignItems: 'center',
    borderBottomWidth: 1, borderBottomColor: '#ecf0f1',
  },
  markAllText: { color: '#3498db', fontWeight: '600', fontSize: 14 },

  list: { padding: 15 },
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14,
    marginBottom: 10, elevation: 2, flexDirection: 'row', alignItems: 'flex-start',
  },
  unreadCard: { backgroundColor: '#f8f9ff', borderLeftWidth: 4, borderLeftColor: '#3498db' },
  unreadDot: {
    width: 10, height: 10, borderRadius: 5, position: 'absolute',
    top: 14, right: 14,
  },

  cardContent: { flexDirection: 'row', alignItems: 'flex-start', flex: 1 },
  iconBox: {
    width: 44, height: 44, borderRadius: 22, justifyContent: 'center',
    alignItems: 'center', marginRight: 12,
  },
  iconText: { fontSize: 20 },
  textContent: { flex: 1 },
  title: { fontSize: 15, fontWeight: '600', color: '#2c3e50', marginBottom: 4 },
  unreadTitle: { fontWeight: '700' },
  body: { fontSize: 13, color: '#7f8c8d', lineHeight: 18, marginBottom: 6 },
  time: { fontSize: 11, color: '#95a5a6' },

  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#2c3e50', marginBottom: 8 },
  emptySubtext: { fontSize: 13, color: '#7f8c8d', textAlign: 'center', paddingHorizontal: 40 },
});

export default NotificationScreen;