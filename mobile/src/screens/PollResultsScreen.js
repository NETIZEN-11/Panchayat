import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, Modal, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
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
        <View style={styles.chartPreview}>
          <BarChart
            data={{
              labels: item.options.slice(0, 4).map((_, i) => `O${i + 1}`),
              datasets: [{ data: item.options.slice(0, 4).map(o => o.votes || 0) }]
            }}
            width={screenWidth - 80}
            height={100}
            chartConfig={{
              backgroundColor: colors.card,
              backgroundGradientFrom: colors.card,
              backgroundGradientTo: colors.card,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(52, 152, 219, ${opacity})`,
              labelColor: () => colors.textSecondary,
              barPercentage: 0.6,
            }}
            style={{ borderRadius: 10 }}
            fromZero
            showValuesOnTopOfBars
          />
        </View>
        <View style={styles.cardFooter}>
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
            <BarChart
              data={{
                labels: selectedPoll.options.map((o, i) => `Option ${i + 1}`),
                datasets: [{ data: selectedPoll.options.map(o => o.votes || 0) }]
              }}
              width={screenWidth - 80}
              height={220}
              chartConfig={{
                backgroundColor: colors.card,
                backgroundGradientFrom: colors.card,
                backgroundGradientTo: colors.card,
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(52, 152, 219, ${opacity})`,
                labelColor: () => colors.text,
                barPercentage: 0.5,
              }}
              style={{ borderRadius: 10, marginVertical: 15 }}
              fromZero
              showValuesOnTopOfBars
            />
            <View style={styles.optionsList}>
              {selectedPoll.options.map((option, index) => {
                const percentage = totalVotes > 0 ? ((option.votes / totalVotes) * 100).toFixed(1) : 0;
                return (
                  <View key={index} style={[styles.optionItem, { backgroundColor: colors.inputBg }]}>
                    <View style={styles.optionHeader}>
                      <Text style={[styles.optionText, { color: colors.text }]}>{option.text}</Text>
                      <Text style={[styles.percentage, { color: '#3498db' }]}>{percentage}%</Text>
                    </View>
                    <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                      <View style={[styles.progressFill, { width: `${percentage}%` }]} />
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
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  question: { flex: 1, fontSize: 16, fontWeight: 'bold', marginRight: 10 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  statusText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  chartPreview: { alignItems: 'center', marginVertical: 10 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#e0e0e0' },
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