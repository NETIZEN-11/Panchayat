import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator,
  RefreshControl, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import api from '../config/api';
import { AuthContext } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';
import { ThemeContext } from '../context/ThemeContext';

const AnnouncementsScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const { t } = useContext(LanguageContext);
  const { colors } = useContext(ThemeContext);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [commentingId, setCommentingId] = useState(null);
  const [commentText, setCommentText] = useState('');

  useEffect(() => { fetchAnnouncements(); }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await api.get('/announcements');
      setAnnouncements(response.data.data || []);
    } catch { setAnnouncements([]); }
    finally { setLoading(false); setRefreshing(false); }
  };

  const onRefresh = () => { setRefreshing(true); fetchAnnouncements(); };

  const submitComment = async (announcementId) => {
    if (!commentText.trim()) return;
    try {
      const res = await api.post(`/announcements/${announcementId}/comments`, { text: commentText.trim() });
      setAnnouncements(prev => prev.map(a => (a._id === announcementId ? res.data.data : a)));
      setCommentText('');
      setCommentingId(null);
    } catch {}
  };

  const getCategoryColor = (category) => {
    const categories = {
      general: '#3498db', urgent: '#e74c3c', event: '#9b59b6',
      meeting: '#f39c12', holiday: '#27ae60', other: '#95a5a6',
    };
    return categories[category] || '#95a5a6';
  };

  const renderComment = (comment, index) => (
    <View key={index} style={[styles.commentItem, { backgroundColor: colors.inputBg }]}>
      <Text style={[styles.commentAuthor, { color: colors.text }]}>{comment.userId?.name || 'Anonymous'}</Text>
      <Text style={[styles.commentText, { color: colors.textSecondary }]}>{comment.text}</Text>
      <Text style={[styles.commentTime, { color: colors.textSecondary }]}>{formatTime(comment.createdAt)}</Text>
    </View>
  );

  const renderAnnouncement = ({ item }) => {
    const catColor = getCategoryColor(item.category);
    return (
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={[styles.categoryBadge, { backgroundColor: catColor }]}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
        <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
        <Text style={[styles.content, { color: colors.textSecondary }]}>{item.content}</Text>
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <Text style={[styles.author, { color: colors.textSecondary }]}>By: {item.createdBy?.name || 'Admin'}</Text>
          <Text style={[styles.date, { color: colors.textSecondary }]}>{new Date(item.createdAt).toLocaleDateString('en-IN')}</Text>
        </View>

        {item.comments && item.comments.length > 0 && (
          <View style={[styles.commentsSection, { borderTopColor: colors.border }]}>
            <Text style={styles.commentsCount}>{item.comments.length} Comments</Text>
            {item.comments.slice(0, 2).map(renderComment)}
            {item.comments.length > 2 && (
              <Text style={styles.moreComments}>+{item.comments.length - 2} more</Text>
            )}
          </View>
        )}

        {commentingId === item._id ? (
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={styles.commentInputRow}>
              <TextInput
                style={[styles.commentInput, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
                placeholder="Write a comment..."
                placeholderTextColor={colors.textSecondary}
                value={commentText}
                onChangeText={setCommentText}
                multiline
              />
              <TouchableOpacity style={styles.sendBtn} onPress={() => submitComment(item._id)}>
                <Text style={styles.sendBtnText}>Send</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => { setCommentingId(null); setCommentText(''); }}>
              <Text style={styles.cancelComment}>Cancel</Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        ) : (
          <TouchableOpacity
            style={[styles.addCommentBtn, { backgroundColor: colors.inputBg }]}
            onPress={() => setCommentingId(item._id)}
          >
            <Text style={styles.addCommentText}>Add Comment</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) {
    return <View style={[styles.centered, { backgroundColor: colors.background }]}><ActivityIndicator size="large" color="#3498db" /></View>;
  }

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: colors.background }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <FlatList
        data={announcements}
        renderItem={renderAnnouncement}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t('no_announcements') || 'No announcements'}</Text>
          </View>
        }
      />
    </KeyboardAvoidingView>
  );
};

const formatTime = (date) => {
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

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 15 },
  card: {
    padding: 20, borderRadius: 15, marginBottom: 15,
    elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4,
  },
  categoryBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginBottom: 10 },
  categoryText: { color: '#fff', fontSize: 12, fontWeight: 'bold', textTransform: 'capitalize' },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  content: { fontSize: 14, lineHeight: 22, marginBottom: 10 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1 },
  author: { fontSize: 12 },
  date: { fontSize: 12 },
  commentsSection: { marginTop: 12, paddingTop: 12, borderTopWidth: 1 },
  commentsCount: { fontSize: 13, color: '#3498db', fontWeight: 'bold', marginBottom: 8 },
  commentItem: { borderRadius: 8, padding: 10, marginBottom: 6 },
  commentAuthor: { fontSize: 12, fontWeight: 'bold', marginBottom: 2 },
  commentText: { fontSize: 13, marginBottom: 3 },
  commentTime: { fontSize: 10 },
  moreComments: { fontSize: 12, color: '#3498db', fontWeight: '600', marginTop: 4 },
  addCommentBtn: { marginTop: 12, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  addCommentText: { color: '#3498db', fontWeight: '600', fontSize: 14 },
  commentInputRow: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 10, gap: 8 },
  commentInput: { flex: 1, borderRadius: 8, borderWidth: 1, padding: 10, fontSize: 14, maxHeight: 80 },
  sendBtn: { backgroundColor: '#3498db', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10 },
  sendBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  cancelComment: { color: '#e74c3c', fontSize: 13, textAlign: 'center', marginTop: 6 },
  empty: { alignItems: 'center', marginTop: 50 },
  emptyText: { fontSize: 16 },
});

export default AnnouncementsScreen;
