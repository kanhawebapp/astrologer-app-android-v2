import React from 'react';
import { View, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { AppText } from '../../../../components/common/AppText';
import { useTheme } from '../../../../hooks/useTheme';
import { LiveSessionStats } from '../../domain/liveTypes';

interface LiveStatsCardProps {
  stats: LiveSessionStats;
  title?: string;
}

export const LiveStatsCard: React.FC<LiveStatsCardProps> = ({
  stats,
  title = 'Live Statistics',
}) => {
  const { theme } = useTheme();

  const formatEarnings = (amount: number) => {
    if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}k`;
    }
    return `₹${amount}`;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.header}>
        <Icon name="stats-chart" size={20} color={theme.colors.primary} />
        <AppText variant="h4" color={theme.colors.text}>
          {title}
        </AppText>
      </View>

      <View style={styles.statsGrid}>
        <View
          style={[
            styles.statCard,
            { backgroundColor: theme.colors.surfaceSecondary },
          ]}>
          <Icon name="eye" size={24} color={theme.colors.primary} />
          <AppText variant="h3" color={theme.colors.text}>
            {stats.viewers}
          </AppText>
          <AppText variant="caption" color={theme.colors.textTertiary}>
            Viewers
          </AppText>
        </View>

        <View
          style={[
            styles.statCard,
            { backgroundColor: theme.colors.surfaceSecondary },
          ]}>
          <Icon name="heart" size={24} color={theme.colors.error} />
          <AppText variant="h3" color={theme.colors.text}>
            {stats.likes}
          </AppText>
          <AppText variant="caption" color={theme.colors.textTertiary}>
            Likes
          </AppText>
        </View>

        <View
          style={[
            styles.statCard,
            { backgroundColor: theme.colors.surfaceSecondary },
          ]}>
          <Icon name="cash" size={24} color={theme.colors.success} />
          <AppText variant="h3" color={theme.colors.success}>
            {formatEarnings(stats.earnings)}
          </AppText>
          <AppText variant="caption" color={theme.colors.textTertiary}>
            Earnings
          </AppText>
        </View>

        <View
          style={[
            styles.statCard,
            { backgroundColor: theme.colors.surfaceSecondary },
          ]}>
          <Icon name="time" size={24} color={theme.colors.primary} />
          <AppText variant="h3" color={theme.colors.text}>
            {stats.duration}m
          </AppText>
          <AppText variant="caption" color={theme.colors.textTertiary}>
            Duration
          </AppText>
        </View>
      </View>

      <View style={styles.secondaryStats}>
        <View style={styles.secondaryStat}>
          <Icon name="people" size={16} color={theme.colors.textTertiary} />
          <AppText variant="caption" color={theme.colors.textSecondary}>
            Peak: {stats.peakViewers}
          </AppText>
        </View>
        <View style={styles.secondaryStat}>
          <Icon name="chatbubble" size={16} color={theme.colors.textTertiary} />
          <AppText variant="caption" color={theme.colors.textSecondary}>
            Comments: {stats.comments}
          </AppText>
        </View>
        <View style={styles.secondaryStat}>
          <Icon name="gift" size={16} color={theme.colors.textTertiary} />
          <AppText variant="caption" color={theme.colors.textSecondary}>
            Gifts: {stats.gifts}
          </AppText>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    gap: 8,
  },
  secondaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  secondaryStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});

export default LiveStatsCard;
