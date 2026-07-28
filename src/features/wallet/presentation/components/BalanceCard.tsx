import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../../../hooks/useTheme';
import { AppText } from '../../../../components/common/AppText';
import { spacing, borderRadius } from '../../../../theme/spacing';

interface BalanceCardProps {
  balance: number;
  todayEarnings?: number;
  lastPayout?: {
    amount: number;
    date: string;
  };
  onWithdrawPress?: () => void;
  astrologerStats?: {
    totalConsultations: number;
    rating: number;
    totalReviews: number;
    activeClients: number;
    isPremium: boolean;
    completedCalls: number;
    completedChats: number;
    completedVideos: number;
  };
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  balance,
  todayEarnings,
  lastPayout,
  onWithdrawPress,
  astrologerStats,
}) => {
  const { theme } = useTheme();

  const formatCurrency = (amount: number): string => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    });
  };

  // const gradientColors =
  //   theme.mode === 'dark'
  //     ? ['#4A42DB', '#6C63FF', '#8B85FF']
  //     : ['#6C63FF', '#8B85FF', '#A5A0FF'];
  const gradientColors =
    theme.mode === 'dark'
      ? [theme.colors.primary+90, theme.colors.primary+70, theme.colors.primary+50]
      : [theme.colors.primary, theme.colors.primary+80, theme.colors.primary+70];

  const containerStyle: ViewStyle = {
    backgroundColor: theme.colors.surface,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  };

  const infoSectionStyle: ViewStyle = {
    backgroundColor: theme.colors.surfaceSecondary,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}>
        <View style={styles.headerRow}>
          <View style={styles.walletIconContainer}>
            <Icon
              name="account-balance-wallet"
              size={24}
              color={theme.colors.white}
            />
          </View>
          <View style={styles.headerLabels}>
            <AppText
              variant="caption"
              color="rgba(255,255,255,0.8)"
              style={styles.label}>
              Available Balance
            </AppText>
            {/* {astrologerStats?.isPremium && (
              <View style={styles.premiumBadge}>
                <AppText
                  variant="caption"
                  color="#6C63FF"
                  style={styles.premiumText}>
                  PREMIUM
                </AppText>
              </View>
            )} */}
          </View>
        </View>

        <AppText variant="h1" color={theme.colors.white} style={styles.balance}>
          {formatCurrency(balance)}
        </AppText>

        {todayEarnings !== undefined && todayEarnings > 0 && (
          <View style={styles.todayEarnings}>
            <AppText variant="caption" color="rgba(255,255,255,0.8)">
              Today's Earnings:{' '}
            </AppText>
            <AppText variant="body2" color={theme.colors.white}>
              {formatCurrency(todayEarnings)}
            </AppText>
          </View>
        )}

        {astrologerStats && (
          <View style={styles.sessionBreakdown}>
            <View style={styles.sessionItem}>
              <Icon name="call" size={20} color={theme.colors.white} />
              <AppText variant="caption" color="rgba(255,255,255,0.9)">
                {astrologerStats.completedCalls}
              </AppText>
            </View>
            <View style={styles.sessionItem}>
              <Icon name="chat" size={20} color={theme.colors.white} />
              <AppText variant="caption" color="rgba(255,255,255,0.9)">
                {astrologerStats.completedChats}
              </AppText>
            </View>
            <View style={styles.sessionItem}>
              <Icon name="videocam" size={20} color={theme.colors.white} />
              <AppText variant="caption" color="rgba(255,255,255,0.9)">
                {astrologerStats.completedVideos}
              </AppText>
            </View>
          </View>
        )}
      </LinearGradient>

      {astrologerStats && (
        <View style={infoSectionStyle}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <AppText variant="caption" color={theme.colors.textSecondary}>
                Consultations
              </AppText>
              <AppText variant="h5" color={theme.colors.text}>
                {astrologerStats.totalConsultations}
              </AppText>
            </View>
            <View style={styles.statItem}>
              <AppText variant="caption" color={theme.colors.textSecondary}>
                Rating
              </AppText>
              <View style={styles.ratingRow}>
                <AppText variant="h5" color={theme.colors.text}>
                  {astrologerStats.rating.toFixed(1)}
                </AppText>
                <Icon
                  name="star"
                  size={16}
                  color="#FFD700"
                  style={styles.starIcon}
                />
              </View>
            </View>
            <View style={styles.statItem}>
              <AppText variant="caption" color={theme.colors.textSecondary}>
                Reviews
              </AppText>
              <AppText variant="h5" color={theme.colors.text}>
                {astrologerStats.totalReviews}
              </AppText>
            </View>
            <View style={styles.statItem}>
              <AppText variant="caption" color={theme.colors.textSecondary}>
                Active Clients
              </AppText>
              <AppText variant="h5" color={theme.colors.text}>
                {astrologerStats.activeClients}
              </AppText>
            </View>
          </View>
        </View>
      )}

      {lastPayout && lastPayout.amount > 0 && (
        <View style={infoSectionStyle}>
          <View style={styles.infoItem}>
            <View>
              <AppText variant="caption" color={theme.colors.textSecondary}>
                Last Payout
              </AppText>
              <AppText variant="body2" color={theme.colors.text}>
                {formatCurrency(lastPayout.amount)}
              </AppText>
              <AppText variant="caption" color={theme.colors.textTertiary}>
                {formatDate(lastPayout.date)}
              </AppText>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    marginTop: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  gradient: {
    padding: spacing.xxl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  walletIconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  headerLabels: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  premiumBadge: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.xs,
  },
  premiumText: {
    fontWeight: '700',
    fontSize: 10,
  },
  balance: {
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  todayEarnings: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sessionBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: borderRadius.md,
  },
  sessionItem: {
    alignItems: 'center',
  },
  withdrawButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  infoSection: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  statsRow: {
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
  starIcon: {
    marginLeft: 2,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
