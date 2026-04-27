import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import api from '../config/api';
import { ThemeContext } from '../context/ThemeContext';

const PollsScreen = () => {
  const { colors } = useContext(ThemeContext);
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { fetchPolls(); }, []);

  const fetchPolls = async () => {
    try {
      const response = await api.get('/polls');
      setPolls(response.data.data || []);
    } catch { setPolls([]); }
    finally { setLoading(false); setRefreshing(false); }
  };

  const onRefresh = () => { setRefreshing(true); fetchPolls(); };

  const handleVote = async (pollId, optionIndex) => {
    try {
      await api.post(`/polls/${pollId}/vote`, { optionIndex });
      Alert.alert('Success', 'Your vote has been recorded');
      fetchPolls();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Vote failed');
    }
  };

  const hasVoted = (poll) => poll.options.some(option => option.votedBy && option.votedBy.length > 0);
  const getTotalVotes = (poll) => poll.options.reduce((sum, option) => sum + (option.votes || 0), 0);
  const getPercentage = (votes, total) => total > 0 ? ((votes / total) * 100).toFixed(1) : 0;

  const renderPoll = ({ item }) => {
    const totalVotes = getTotalVotes(item);
    const voted = hasVoted(item);
    return (
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.question, { color: colors.text }]}>{item.question}</Text>
        {item.options.map((option, index) => (
          <View key={index} style={styles.optionContainer}>
            {voted ? (
              <View style={styles.resultContainer}>
                <View style={styles.resultHeader}>
                  <Text style={[styles.optionText, { color: colors.text }]}>{option.text}</Text>
                  <Text style={styles.percentage}>{getPercentage(option.votes, totalVotes)}%</Text>
                </View>
                <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                  <View style={[styles.progressFill, { width: `${getPercentage(option.votes, totalVotes)}%` }]} />
                </View>
                <Text style={[styles.voteCount, { color: colors.textSecondary }]}>{option.votes} votes</Text>
              </View>
            ) : (
              <TouchableOpacity style={styles.optionButton} onPress={() => handleVote(item._id, index)}>
                <Text style={styles.optionButtonText}>{option.text}</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <Text style={[styles.totalVotes, { color: colors.textSecondary }]}>Total votes: {totalVotes}</Text>
          {item.endDate && <Text style={[styles.endDate, { color: colors.textSecondary }]}>Ends: {new Date(item.endDate).toLocaleDateString()}</Text>}
        </View>
      </View>
    );
  };

  if (loading) {
    return <View style={[styles.centered, { backgroundColor: colors.background }]}><ActivityIndicator size="large" color="#3498db" /></View>;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={polls}
        renderItem={renderPoll}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No polls available</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 15 },
  card: { padding: 15, borderRadius: 10, marginBottom: 15, elevation: 2 },
  question: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  optionContainer: { marginBottom: 10 },
  optionButton: { backgroundColor: '#3498db', padding: 15, borderRadius: 8, alignItems: 'center' },
  optionButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  resultContainer: { marginBottom: 5 },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  optionText: { fontSize: 14, fontWeight: '500' },
  percentage: { fontSize: 14, color: '#3498db', fontWeight: 'bold' },
  progressBar: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#3498db' },
  voteCount: { fontSize: 12, marginTop: 3 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15, paddingTop: 15, borderTopWidth: 1 },
  totalVotes: { fontSize: 12, fontWeight: 'bold' },
  endDate: { fontSize: 12 },
  empty: { alignItems: 'center', marginTop: 50 },
  emptyText: { fontSize: 16 },
});

export default PollsScreen;
