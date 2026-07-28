import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../../../../hooks/useTheme';

const ShimmerItem: React.FC<{
  width?: number | string;
  height: number;
  borderRadius?: number;
}> = ({ width = '100%', height, borderRadius = 8 }) => {
  const { theme } = useTheme();
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
    );
    shimmer.start();
    return () => shimmer.stop();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: theme.colors.surfaceSecondary,
        },
        { opacity },
      ]}
    />
  );
};

export const HomeSkeleton: React.FC = () => {
  const { theme } = useTheme();

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <ShimmerItem width={180} height={32} borderRadius={8} />
        <ShimmerItem width={100} height={18} borderRadius={6} />
        <View
          style={[
            styles.statusCard,
            { backgroundColor: theme.colors.surfaceSecondary },
          ]}>
          <ShimmerItem width={60} height={24} borderRadius={12} />
          <ShimmerItem width={80} height={16} borderRadius={6} />
        </View>
      </View>

      <View style={styles.filters}>
        <View style={styles.filterRow}>
          <ShimmerItem width={70} height={36} borderRadius={18} />
          <ShimmerItem width={70} height={36} borderRadius={18} />
          <ShimmerItem width={70} height={36} borderRadius={18} />
        </View>
      </View>

      <View style={styles.statsSection}>
        <ShimmerItem width={80} height={24} borderRadius={6} />
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <ShimmerItem width={36} height={36} borderRadius={10} />
            <ShimmerItem width="80%" height={14} borderRadius={4} />
            <ShimmerItem width="60%" height={24} borderRadius={6} />
          </View>
          <View style={styles.statCard}>
            <ShimmerItem width={36} height={36} borderRadius={10} />
            <ShimmerItem width="80%" height={14} borderRadius={4} />
            <ShimmerItem width="60%" height={24} borderRadius={6} />
          </View>
        </View>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <ShimmerItem width={36} height={36} borderRadius={10} />
            <ShimmerItem width="80%" height={14} borderRadius={4} />
            <ShimmerItem width="60%" height={24} borderRadius={6} />
          </View>
          <View style={styles.statCard}>
            <ShimmerItem width={36} height={36} borderRadius={10} />
            <ShimmerItem width="80%" height={14} borderRadius={4} />
            <ShimmerItem width="60%" height={24} borderRadius={6} />
          </View>
        </View>
      </View>

      <View style={styles.chartSection}>
        <ShimmerItem width={140} height={20} borderRadius={6} />
        <ShimmerItem width={100} height={32} borderRadius={8} />
        <View style={styles.chartPlaceholder}>
          <View style={styles.chartLine} />
          <View style={styles.chartLine} />
          <View style={styles.chartLine} />
          <View style={styles.chartLine} />
          <View style={styles.chartLine} />
          <View style={styles.chartLine} />
        </View>
      </View>

      <View style={styles.insightSection}>
        <ShimmerItem width={80} height={24} borderRadius={6} />
        <View style={styles.insightScroll}>
          <ShimmerItem width={250} height={80} borderRadius={16} />
          <ShimmerItem width={250} height={80} borderRadius={16} />
        </View>
      </View>

      <View style={styles.activitySection}>
        <ShimmerItem width={120} height={24} borderRadius={6} />
        <View style={styles.activityList}>
          {[1, 2, 3].map(i => (
            <View key={i} style={styles.activityItem}>
              <ShimmerItem width={32} height={32} borderRadius={16} />
              <View style={styles.activityText}>
                <ShimmerItem width="70%" height={14} borderRadius={4} />
                <ShimmerItem width="50%" height={12} borderRadius={4} />
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
  },
  header: {
    paddingHorizontal: 20,
    gap: 8,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 18,
    marginTop: 8,
  },
  filters: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statsSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 18,
    gap: 12,
  },
  chartSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  chartPlaceholder: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 180,
    paddingTop: 20,
  },
  chartLine: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 4,
  },
  insightSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  insightScroll: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 14,
  },
  activitySection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  activityList: {
    marginTop: 14,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  activityText: {
    marginLeft: 12,
    flex: 1,
    gap: 6,
  },
});
