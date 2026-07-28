import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../../../hooks/useTheme';
import { AppText } from '../../../../components/common/AppText';
import { spacing, borderRadius } from '../../../../theme/spacing';

interface PremiumStatsCardProps {
  stats: {
    totalConsultations: number;
    rating: number;
    totalReviews: number;
    activeClients: number;
    avgResponseTime: string;
    completionRate: number;
    totalEarnings: number;
    monthlyEarnings: number;
    weeklyEarnings: number;
    todayEarnings: number;
    pendingPayout: number;
    successfulSessions: number;
    cancelledSessions: number;
    repeatClients: number;
  };
  onViewDetails?: () => void;
}

export const PremiumStatsCard: React.FC<PremiumStatsCardProps> = ({
  stats,
  onViewDetails,
}) => {
  const { theme } = useTheme();

  const formatCurrency = (amount: number): string => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Icon name="bar-chart" size={24} color={theme.colors.primary} />
          <AppText
            variant="h5"
            color={theme.colors.text}
            style={styles.titleText}>
            Astrologer Analytics
          </AppText>
        </View>
        {onViewDetails && (
          <TouchableOpacity onPress={onViewDetails}>
            <AppText variant="caption" color={theme.colors.primary}>
              View Details
            </AppText>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.earningsGrid}>
        <LinearGradient
          colors={['#4CAF50', '#81C784']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.earningCard}>
          <AppText variant="caption" color="rgba(255,255,255,0.8)">
            Today
          </AppText>
          <AppText variant="h4" color={theme.colors.white}>
            {formatCurrency(stats.todayEarnings)}
          </AppText>
        </LinearGradient>

        <LinearGradient
          colors={['#2196F3', '#64B5F6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.earningCard}>
          <AppText variant="caption" color="rgba(255,255,255,0.8)">
            This Week
          </AppText>
          <AppText variant="h4" color={theme.colors.white}>
            {formatCurrency(stats.weeklyEarnings)}
          </AppText>
        </LinearGradient>

        <LinearGradient
          colors={['#9C27B0', '#BA68C8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.earningCard}>
          <AppText variant="caption" color="rgba(255,255,255,0.8)">
            This Month
          </AppText>
          <AppText variant="h4" color={theme.colors.white}>
            {formatCurrency(stats.monthlyEarnings)}
          </AppText>
        </LinearGradient>

        <LinearGradient
          colors={['#FF9800', '#FFB74D']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.earningCard}>
          <AppText variant="caption" color="rgba(255,255,255,0.8)">
            Total Earned
          </AppText>
          <AppText variant="h4" color={theme.colors.white}>
            {formatCurrency(stats.totalEarnings)}
          </AppText>
        </LinearGradient>
      </View>

      <View
        style={[styles.statsSection, { borderTopColor: theme.colors.border }]}>
        <AppText
          variant="caption"
          color={theme.colors.textSecondary}
          style={styles.sectionTitle}>
          Session Statistics
        </AppText>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <AppText variant="h4" color={theme.colors.text}>
              {stats.totalConsultations}
            </AppText>
            <AppText variant="caption" color={theme.colors.textSecondary}>
              Total Sessions
            </AppText>
          </View>
          <View style={styles.statItem}>
            <AppText variant="h4" color={theme.colors.success}>
              {stats.successfulSessions}
            </AppText>
            <AppText variant="caption" color={theme.colors.textSecondary}>
              Completed
            </AppText>
          </View>
          <View style={styles.statItem}>
            <AppText variant="h4" color={theme.colors.error}>
              {stats.cancelledSessions}
            </AppText>
            <AppText variant="caption" color={theme.colors.textSecondary}>
              Cancelled
            </AppText>
          </View>
          <View style={styles.statItem}>
            <AppText variant="h4" color={theme.colors.primary}>
              {stats.completionRate}%
            </AppText>
            <AppText variant="caption" color={theme.colors.textSecondary}>
              Completion Rate
            </AppText>
          </View>
        </View>
      </View>

      <View
        style={[styles.statsSection, { borderTopColor: theme.colors.border }]}>
        <AppText
          variant="caption"
          color={theme.colors.textSecondary}
          style={styles.sectionTitle}>
          Client Statistics
        </AppText>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <AppText variant="h4" color={theme.colors.text}>
              {stats.activeClients}
            </AppText>
            <AppText variant="caption" color={theme.colors.textSecondary}>
              Active Clients
            </AppText>
          </View>
          <View style={styles.statItem}>
            <AppText variant="h4" color={theme.colors.text}>
              {stats.repeatClients}
            </AppText>
            <AppText variant="caption" color={theme.colors.textSecondary}>
              Repeat Clients
            </AppText>
          </View>
          <View style={styles.statItem}>
            <AppText variant="h4" color={theme.colors.text}>
              {stats.totalReviews}
            </AppText>
            <AppText variant="caption" color={theme.colors.textSecondary}>
              Reviews
            </AppText>
          </View>
          <View style={styles.statItem}>
            <View style={styles.ratingRow}>
              <AppText variant="h4" color={theme.colors.text}>
                {stats.rating.toFixed(1)}
              </AppText>
              <Icon
                name="star"
                size={18}
                color="#FFD700"
                style={styles.ratingStar}
              />
            </View>
            <AppText variant="caption" color={theme.colors.textSecondary}>
              Rating
            </AppText>
          </View>
        </View>
      </View>

      <View
        style={[styles.statsSection, { borderTopColor: theme.colors.border }]}>
        <AppText
          variant="caption"
          color={theme.colors.textSecondary}
          style={styles.sectionTitle}>
          Performance
        </AppText>
        <View style={styles.perfRow}>
          <View style={styles.perfItem}>
            <AppText variant="caption" color={theme.colors.textSecondary}>
              Avg. Response Time
            </AppText>
            <AppText variant="body1" color={theme.colors.text}>
              {stats.avgResponseTime}
            </AppText>
          </View>
          <View style={styles.perfItem}>
            <AppText variant="caption" color={theme.colors.textSecondary}>
              Pending Payout
            </AppText>
            <AppText variant="body1" color={theme.colors.warning}>
              {formatCurrency(stats.pendingPayout)}
            </AppText>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  titleText: {
    marginLeft: spacing.xs,
  },
  earningsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  earningCard: {
    width: '48%',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  statsSection: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingStar: {
    marginLeft: 2,
  },
  perfRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  perfItem: {
    alignItems: 'flex-start',
  },
});
