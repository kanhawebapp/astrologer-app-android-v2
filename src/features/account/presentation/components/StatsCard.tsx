import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { AppText } from '../../../../components/common/AppText';
import { useTheme } from '../../../../hooks/useTheme';
import { Stats, AccountProfile } from '../../domain/types';

interface StatsCardProps {
  stats: Stats;
  profile: AccountProfile;
}

export const StatsCard: React.FC<StatsCardProps> = ({ stats, profile }) => {
  const { theme } = useTheme();

  const statItems = [
    {
      label: 'Balance',
      value: `₹${stats.balance.toLocaleString()}`,
      icon: 'wallet',
      color: theme.colors.success,
      bgColor: theme.colors.successLight,
    },
    {
      label: 'Total Earned',
      value: `₹${stats.totalEarned.toLocaleString()}`,
      icon: 'wallet',
      color: theme.colors.success,
      bgColor: theme.colors.successLight,
    },
    {
      label: 'Total Withdrawn',
      value: `₹${stats.totalWithdrawn.toLocaleString()}`,
      icon: 'wallet',
      color: theme.colors.error,
      bgColor: theme.colors.errorLight,
    },
    {
      label: 'Total Sessions',
      value: profile.totalSessions.toLocaleString(),
      icon: 'people',
      color: theme.colors.primary,
      bgColor: theme.colors.primaryLight,
    },
    {
      label: 'Total Reviews',
      value: profile.totalReviews.toLocaleString(),
      icon: 'star',
      color: theme.colors.accentGold,
      bgColor: theme.colors.accentGoldLight,
    },
    {
      label: 'Rating',
      value: profile.rating.toFixed(1),
      icon: 'star',
      color: theme.colors.accentGold,
      bgColor: theme.colors.accentGoldLight,
    },
  ];

  const renderStatItem = (
    label: string,
    value: string,
    icon: string,
    color: string,
    bgColor: string,
  ) => (
    <TouchableOpacity
      style={[
        styles.statItem,
        { backgroundColor: theme.colors.surfaceSecondary },
      ]}
      activeOpacity={0.8}>
      <View style={[styles.statIconContainer,
         { backgroundColor: theme.colors.primary+20 }]}>
        <Icon name={icon} size={20} color={theme.colors.primary} />
      </View>
      <AppText variant="h5" color={theme.colors.text}  style={styles.statValue}>
        {value}
      </AppText>
      <AppText variant="caption" color={theme.colors.textTertiary}>
        {label}
      </AppText>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.header}>
        <AppText variant="h5" color={theme.colors.text}>
          Performance Stats
        </AppText>
      </View>

      <View
        style={[styles.divider, { backgroundColor: theme.colors.border }]}
      />

      <View style={styles.statsGrid}>
        {/* First row */}
        <View style={styles.statsRow}>
          <View style={styles.statItemWrapper}>
            {renderStatItem(
              statItems[0].label,
              statItems[0].value,
              statItems[0].icon,
              statItems[0].color,
              statItems[0].bgColor,
            )}
          </View>
          <View style={styles.statItemWrapper}>
            {renderStatItem(
              statItems[1].label,
              statItems[1].value,
              statItems[1].icon,
              statItems[1].color,
              statItems[1].bgColor,
            )}
          </View>
          <View style={styles.statItemWrapper}>
            {renderStatItem(
              statItems[2].label,
              statItems[2].value,
              statItems[2].icon,
              statItems[2].color,
              statItems[2].bgColor,
            )}
          </View>
        </View>
        {/* Second row */}
        <View style={styles.statsRow}>
          <View style={styles.statItemWrapper}>
            {renderStatItem(
              statItems[3].label,
              statItems[3].value,
              statItems[3].icon,
              statItems[3].color,
              statItems[3].bgColor,
            )}
          </View>
          <View style={styles.statItemWrapper}>
            {renderStatItem(
              statItems[4].label,
              statItems[4].value,
              statItems[4].icon,
              statItems[4].color,
              statItems[4].bgColor,
            )}
          </View>
          <View style={styles.statItemWrapper}>
            {renderStatItem(
              statItems[5].label,
              statItems[5].value,
              statItems[5].icon,
              statItems[5].color,
              statItems[5].bgColor,
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    marginBottom: 12,
  },
  divider: {
    height: 1,
    marginBottom: 16,
  },
  statsGrid: {
    gap: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    flex: 1,
    padding: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'gray',
    alignItems: 'center',
  },
  statItemWrapper: {
    flex: 1,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    marginBottom: 4,
  },
});
