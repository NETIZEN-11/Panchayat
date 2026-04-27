import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

export const SkeletonCard = ({ style }) => {
  const fadeAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <Animated.View style={[styles.card, style, { opacity: fadeAnim }]}>
      <View style={[styles.line, { width: '60%', height: 16 }]} />
      <View style={[styles.line, { width: '40%', height: 12, marginTop: 8 }]} />
      <View style={[styles.line, { width: '80%', height: 12, marginTop: 6 }]} />
      <View style={[styles.line, { width: '30%', height: 10, marginTop: 12 }]} />
    </Animated.View>
  );
};

export const SkeletonList = ({ count = 5, cardStyle }) => (
  <View style={styles.list}>
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} style={cardStyle} />
    ))}
  </View>
);

const styles = StyleSheet.create({
  list: { padding: 15 },
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 15,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 2,
  },
  line: {
    backgroundColor: '#e8e8e8', borderRadius: 4,
  },
});
