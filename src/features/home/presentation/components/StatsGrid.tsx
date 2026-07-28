import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AppText } from '../../../../components/common/AppText';
import { useTheme } from '../../../../hooks/useTheme';
import { HomeStats } from '../../domain/types';

interface StatsGridProps {
  stats: HomeStats;
  earnings: number;
  rating: number;
}

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  color: string;
  theme: any;
  onPress?: () => void;
  gradient?: boolean;
  gradientColors?: string[];
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  color,
  theme,
  onPress,
  gradient = false,
  gradientColors,
}) => (
  <TouchableOpacity
    style={styles.statCard}
    onPress={onPress}
    activeOpacity={0.7}>
    {gradient && gradientColors ? (
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientContent}>
        <View style={styles.gradientIconContainer}>
          <Icon name={icon} size={24} color={theme.colors.white} />
        </View>
        <AppText variant="h2" color={theme.colors.white} style={styles.value}>
          {value}
        </AppText>
        <AppText variant="body2" color="rgba(255,255,255,0.85)">
          {label}
        </AppText>
      </LinearGradient>
    ) : (
      <View style={styles.normalContent}>
        <View style={[styles.iconContainer, { backgroundColor: `${color}12` }]}>
          <Icon name={icon} size={22} color={color} />
        </View>
        <AppText variant="h3" color={theme.colors.text} style={styles.value}>
          {value}
        </AppText>
        <AppText
          variant="caption"
          color={theme.colors.textSecondary}
          style={styles.label}>
          {label}
        </AppText>
      </View>
    )}
  </TouchableOpacity>
);

export const StatsGrid: React.FC<StatsGridProps> = ({
  stats,
  earnings,
  rating,
}) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <AppText
        variant="h5"
        color={theme.colors.text}
        style={styles.sectionTitle}>
        Your Stats
      </AppText>
      <View style={styles.highlightCard}>
        <LinearGradient
          colors={['#6C63FF', '#8B5CF6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.highlightGradient}>
          <View style={styles.highlightContent}>
            <View style={styles.highlightInfo}>
              <View style={styles.highlightLabelRow}>
                <Icon
                  name="account-balance-wallet"
                  size={18}
                  color={theme.colors.white}
                />
                <AppText variant="caption" color="rgba(255,255,255,0.85)">
                  Today's Earnings
                </AppText>
              </View>
              <AppText
                variant="h1"
                color={theme.colors.white}
                style={styles.highlightValue}>
                ₹{earnings.toLocaleString()}
              </AppText>
              <View style={styles.trendBadge}>
                <Icon name="trending-up" size={14} color={theme.colors.white} />
                <AppText variant="caption" color={theme.colors.white}>
                  +12% from yesterday
                </AppText>
              </View>
            </View>
            <View style={styles.highlightIconWrapper}>
              <View style={styles.iconCircleBg}>
                <Icon
                  name="account-balance-wallet"
                  size={32}
                  color="rgba(255,255,255,0.4)"
                />
              </View>
            </View>
          </View>
          <View style={styles.highlightDecoration1} />
          <View style={styles.highlightDecoration2} />
        </LinearGradient>
      </View>
      <View style={styles.row}>
        <StatCard
          icon="chat"
          label="Active Sessions"
          value={stats.active}
          color={theme.colors.primary}
          theme={theme}
          gradient
          gradientColors={['#6366F1', '#4F46E5']}
        />
        <StatCard
          icon="check-circle"
          label="Total Sessions"
          value={stats.completed}
          color={theme.colors.info}
          theme={theme}
          gradient
          gradientColors={['#3B82F6', '#2563EB']}
        />
      </View>
      <View style={styles.row}>
        <StatCard
          icon="star"
          label="Rating"
          value={rating.toFixed(1)}
          color={theme.colors.warning}
          theme={theme}
          gradient
          gradientColors={['#F59E0B', '#D97706']}
        />
        <StatCard
          icon="pending"
          label="Pending"
          value={stats.pending}
          color={theme.colors.secondary}
          theme={theme}
          gradient
          gradientColors={['#EC4899', '#DB2777']}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    gap: 12,
  },
  sectionTitle: {
    marginBottom: 4,
    paddingHorizontal: 4,
    fontWeight: '600',
  },
  highlightCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 4,
  },
  highlightGradient: {
    padding: 20,
  },
  highlightContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  highlightInfo: {
    flex: 1,
  },
  highlightLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  highlightValue: {
    fontWeight: '700',
    marginBottom: 10,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 4,
  },
  highlightIconWrapper: {
    position: 'relative',
  },
  iconCircleBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  highlightDecoration1: {
    position: 'absolute',
    top: -25,
    right: -25,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  highlightDecoration2: {
    position: 'absolute',
    bottom: -30,
    left: '30%',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  gradientContent: {
    padding: 18,
    alignItems: 'center',
  },
  gradientIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  normalContent: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  value: {
    marginBottom: 4,
    fontWeight: '700',
  },
  label: {
    textAlign: 'center',
  },
});
