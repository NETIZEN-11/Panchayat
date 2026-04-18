import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const HistoryTimeline = ({ timeline }) => {
  if (!timeline || timeline.length === 0) {
    return <Text style={styles.noData}>No history available</Text>;
  }

  return (
    <View style={styles.container}>
      {timeline.map((item, index) => (
        <View key={index} style={styles.item}>
          <View style={styles.leftColumn}>
            <View style={[styles.dot, index === 0 && styles.activeDot]} />
            {index < timeline.length - 1 && <View style={styles.line} />}
          </View>
          <View style={styles.rightColumn}>
            <Text style={styles.status}>{item.status}</Text>
            {item.notes && <Text style={styles.notes}>{item.notes}</Text>}
            <Text style={styles.date}>
              {new Date(item.updatedAt).toLocaleDateString()} {new Date(item.updatedAt).toLocaleTimeString()}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
  },
  item: {
    flexDirection: 'row',
  },
  leftColumn: {
    alignItems: 'center',
    marginRight: 15,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#bdc3c7',
  },
  activeDot: {
    backgroundColor: '#3498db',
    transform: [{ scale: 1.2 }],
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: '#bdc3c7',
    marginVertical: 4,
  },
  rightColumn: {
    flex: 1,
    paddingBottom: 20,
  },
  status: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  notes: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 4,
  },
  date: {
    fontSize: 12,
    color: '#95a5a6',
    marginTop: 4,
  },
  noData: {
    textAlign: 'center',
    color: '#7f8c8d',
    padding: 20,
  },
});

export default HistoryTimeline;
