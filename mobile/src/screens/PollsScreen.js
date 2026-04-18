import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import api from '../config/api';

const PollsScreen = () => {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    try {
      const response = await api.get('/polls');
      setPolls(response.data.data || []);
    } catch (error) {
      console.error('Error fetching polls:', error);
      setPolls([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (pollId, optionIndex) => {
    try {
      await api.post(`/polls/${pollId}/vote`, { optionIndex });
      Alert.alert('Success', 'Your vote has been recorded');
      fetchPolls();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Vote failed');
    }
  };

  const hasVoted = (poll) => {
    return poll.options.some(option =>
      option.votedBy && option.votedBy.length > 0
    );
  };

  const getTotalVotes = (poll) => {
    return poll.options.reduce((sum, option) => sum + (option.votes || 0), 0);
  };

  const getPercentage = (votes, total) => {
    return total > 0 ? ((votes / total) * 100).toFixed(1) : 0;
  };

  const renderPoll = ({ item }) => {
    const totalVotes = getTotalVotes(item);
    const voted = hasVoted(item);

    return (
      <View style={styles.card}>
        <Text style={styles.question}>{item.question}</Text>

        {item.options.map((option, index) => (
          <View key={index} style={styles.optionContainer}>
            {voted ? (
              <View style={styles.resultContainer}>
                <View style={styles.resultHeader}>
                  <Text style={styles.optionText}>{option.text}</Text>
                  <Text style={styles.percentage}>
                    {getPercentage(option.votes, totalVotes)}%
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${getPercentage(option.votes, totalVotes)}%` }
                    ]}
                  />
                </View>
                <Text style={styles.voteCount}>
                  {option.votes} votes
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.optionButton}
                onPress={() => handleVote(item._id, index)}
              >
                <Text style={styles.optionButtonText}>{option.text}</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={styles.totalVotes}>Total votes: {totalVotes}</Text>
          {item.endDate && (
            <Text style={styles.endDate}>
              Ends: {new Date(item.endDate).toLocaleDateString()}
            </Text>
          )}
        </View>
      </View>
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
      <FlatList
        data={polls}
        renderItem={renderPoll}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No polls available</Text>
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
  question: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  optionContainer: {
    marginBottom: 10,
  },
  optionButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  optionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultContainer: {
    marginBottom: 5,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  optionText: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
  },
  percentage: {
    fontSize: 14,
    color: '#3498db',
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#ecf0f1',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3498db',
  },
  voteCount: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 3,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  totalVotes: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: 'bold',
  },
  endDate: {
    fontSize: 12,
    color: '#95a5a6',
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

export default PollsScreen;
