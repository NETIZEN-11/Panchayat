import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, Modal, Dimensions,
} from 'react-native';
import api from '../config/api';
import { ThemeContext } from '../context/ThemeContext';

const screenWidth = Dimensions.get('window').width;

const PollResultsScreen = () => {
  const { colors } = useContext(ThemeContext);
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPoll, setSelectedPoll] = useState(null);

  useEffect(() => { fetchPolls(); }, []);

  const fetchPolls = async () => {
    try {
      const response = await api.get('/polls');
      setPolls(response.data.data || []);
    } catch { setPolls([]); }
    finally { setLoading(false); setRefreshing(false); }
  };

  const onRefresh = () => { setRefreshing(true); fetchPolls(); };

  const getTotalVotes = (poll) => poll.options.reduce((sum, option) => sum + (option.votes || 0), 0);

  const getWinningOption = (poll) => {
    if (!poll.options || poll.options.length === 0) return null;
    return poll.options.reduce((prev, current) => (current.votes || 0) > (prev.votes || 0) ? current : prev);
  };

  // Simple bar chart using View widths instead of react-native-chart-kit
  const SimpleBar = ({ label, votes, total, color = '#3498db' }) => {
    const pct = total > 0 ? (votes / total) * 100 : 0;
    return (
      <View style={styles.barRow}>
        <Text style={[styles.barLabel, { color: colors.textSecondary }]} numberOfLines={1}>{label}</Text>
        <View style={[styles.barTrack, { backgroundColor: colors.border }]}>
          <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: color }]} />
        </View>
        <Text style={[styles.barValue, { color: colors.text }]}>{votes}</Text>
      </View>
    );
  };

  const renderPollCard = ({ item }) => {
    const totalVotes = getTotalVotes(item);
    const winner = getWinningOption(item);
    return (
      <TouchableOpacity style={[styles.card, { backgroundColor: colors.card }]} onPress={() => setSelectedPoll(item)}>
        <View style={styles.cardHeader}>
          <Text style={[styles.question, { color: colors.text }]} numberOfLines={2}>{item.question}</Text>
          <View style={[styles.statusBadge, { backgroundColor: item.isActive ? '#27ae60' : '#95a5a6' }]}>
            <Text style={styles.statusText}>{item.isActive ? 'Active' : 'Closed'}</Text>
          </View>
        </View>

        {/* Mini bar preview */}
        <View style={styles.previewBars}>
          {item.options.slice(0, 4).map((opt, i) => (
            <SimpleBar
              key={i}
              label={opt.text}
              votes={opt.votes || 0}
              total={totalVotes}
            />
          ))}
        </View>

        <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
          <Text style={[styles.voteCount, { color: colors.textSecondary }]}>Total: {totalVotes} votes</Text>
          <Text style={[styles.winnerText, { color: '#27ae60' }]}>Leading: {winner?.text || 'N/A'}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderPollDetail = () => {
    if (!selectedPoll) return null;
    const totalVotes = getTotalVotes(selectedPoll);
    return (
      <Modal visible={true} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedPoll(null)}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{selectedPoll.question}</Text>
            {selectedPoll.questionHindi && (
              <Text style={[styles.hindiText, { color: colors.textSecondary }]}>{selectedPoll.questionHindi}</Text>
            )}

            <View style={styles.optionsList}>
              {selectedPoll.options.map((option, index) => {
                const pct = totalVotes > 0 ? ((option.votes / totalVotes) * 100).toFixed(1) : 0;
                return (
                  <View key={index} style={[styles.optionItem, { backgroundColor: colors.inputBg }]}>
                    <View style={styles.optionHeader}>
                      <Text style={[styles.optionText, { color: colors.text }]}>{option.text}</Text>
                      <Text style={[styles.percentage, { color: '#3498db' }]}>{pct}%</Text>
                    </View>
                    <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                      <View style={[styles.progressFill, { width: `${pct}%` }]} />
                    </View>
                    <Text style={[styles.optionVotes, { color: colors.textSecondary }]}>{option.votes || 0} votes</Text>
                  </View>
                );
              })}
            </View>
            <Text style={[styles.totalText, { color: colors.textSecondary }]}>Total Votes: {totalVotes}</Text>
          </View>
        </View>
      </Modal>
    );
  };

  if (loading) {
    return <View style={[styles.centered, { backgroundColor: colors.background }]}><ActivityIndicator size="large" color="#3498db" /></View>;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={polls}
        renderItem={renderPollCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No polls available</Text>
          </View>
        }
      />
      {selectedPoll && renderPollDetail()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 15 },
  card: { padding: 15, borderRadius: 12, marginBottom: 15, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  question: { flex: 1, fontSize: 16, fontWeight: 'bold', marginRight: 10 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  statusText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  previewBars: { gap: 6, marginBottom: 12 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  barLabel: { width: 80, fontSize: 11 },
  barTrack: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  barValue: { width: 24, fontSize: 11, fontWeight: 'bold', textAlign: 'right' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10, borderTopWidth: 1 },
  voteCount: { fontSize: 12, fontWeight: 'bold' },
  winnerText: { fontSize: 12, fontWeight: 'bold' },
  empty: { alignItems: 'center', marginTop: 50 },
  emptyText: { fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { borderRadius: 15, padding: 20, maxHeight: '90%' },
  closeBtn: { alignSelf: 'flex-end', padding: 5 },
  closeBtnText: { fontSize: 20, color: '#666' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 5, textAlign: 'center' },
  hindiText: { fontSize: 14, textAlign: 'center', marginBottom: 10 },
  optionsList: { gap: 10, marginVertical: 10 },
  optionItem: { padding: 12, borderRadius: 8 },
  optionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  optionText: { fontSize: 14, fontWeight: '500', flex: 1 },
  percentage: { fontSize: 14, fontWeight: 'bold' },
  progressBar: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#3498db' },
  optionVotes: { fontSize: 11, marginTop: 3 },
  totalText: { fontSize: 14, fontWeight: 'bold', textAlign: 'center', marginTop: 10 },
});

export default PollResultsScreen;
