import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AppText } from '../../../../components/common/AppText';
import { useTheme } from '../../../../hooks/useTheme';
import { Earnings } from '../../domain/types';

interface EarningsCardProps {
  earnings: Earnings;
  onWithdrawPress?: () => void;
  onWalletPress?: () => void;
}

export const EarningsCard: React.FC<EarningsCardProps> = ({
  earnings,
  onWithdrawPress,
  onWalletPress,
}) => {
  const { theme } = useTheme();

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString()}`;

  const EarningsRow: React.FC<{
    label: string;
    value: string;
    isHighlight?: boolean;
    icon?: string;
  }> = ({ label, value, isHighlight = false, icon }) => (
    <View style={styles.earningsRow}>
      <View style={styles.rowLabel}>
        {icon && (
          <View
            style={[
              styles.rowIcon,
              { backgroundColor: `${theme.colors.success}12` },
            ]}>
            <Icon name={icon} size={14} color={theme.colors.success} />
          </View>
        )}
        <AppText variant="body2" color={theme.colors.textSecondary}>
          {label}
        </AppText>
      </View>
      <AppText
        variant={isHighlight ? 'h5' : 'body1'}
        color={isHighlight ? theme.colors.success : theme.colors.text}
        style={isHighlight && styles.highlightValue}>
        {value}
      </AppText>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View
            style={[
              styles.titleIcon,
              { backgroundColor: `${theme.colors.primary}12` },
            ]}>
            <LinearGradient
              colors={['#6C63FF', '#8B5CF6']}
              style={styles.titleIconGradient}>
              <Icon
                name="account-balance-wallet"
                size={18}
                color={theme.colors.white}
              />
            </LinearGradient>
          </View>
          <AppText variant="h5" color={theme.colors.text}>
            Earnings
          </AppText>
        </View>
        <TouchableOpacity
          onPress={onWalletPress}
          activeOpacity={0.7}
          style={styles.viewAllButton}>
          <AppText variant="body2" color={theme.colors.primary}>
            View All
          </AppText>
          <Icon name="chevron-right" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.todayCard}>
        <LinearGradient
          colors={['#6C63FF', '#8B5CF6', '#A855F7']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.todayGradient}>
          <View style={styles.todayContent}>
            <View style={styles.todayLabelRow}>
              <Icon name="trending-up" size={16} color={theme.colors.white} />
              <AppText
                variant="caption"
                color={theme.colors.white}
                style={styles.todayLabel}>
                Today's Earnings
              </AppText>
              <View style={styles.todayBadge}>
                <Icon name="bolt" size={12} color="#FFD700" />
                <AppText variant="caption" color="#FFD700">
                  Top Earner
                </AppText>
              </View>
            </View>
            <AppText
              variant="h1"
              color={theme.colors.white}
              style={styles.todayAmount}>
              {formatCurrency(earnings.today)}
            </AppText>
            <View style={styles.todayStats}>
              <View style={styles.todayStat}>
                <AppText variant="caption" color="rgba(255,255,255,0.7)">
                  Weekly
                </AppText>
                <AppText variant="body2" color={theme.colors.white}>
                  {formatCurrency(earnings.weekly)}
                </AppText>
              </View>
              <View style={styles.todayStatDivider} />
              <View style={styles.todayStat}>
                <AppText variant="caption" color="rgba(255,255,255,0.7)">
                  Monthly
                </AppText>
                <AppText variant="body2" color={theme.colors.white}>
                  {formatCurrency(earnings.monthly)}
                </AppText>
              </View>
            </View>
          </View>
          <View style={styles.todayRight}>
            <View style={styles.iconCircleWrapper}>
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: 'rgba(255,255,255,0.2)' },
                ]}>
                <Icon
                  name="account-balance-wallet"
                  size={32}
                  color={theme.colors.white}
                />
              </View>
            </View>
          </View>
          <View style={styles.cardGlow1} />
          <View style={styles.cardGlow2} />
        </LinearGradient>
      </View>

      <View style={styles.breakdown}>
        <EarningsRow
          label="Total Earned"
          value={formatCurrency(earnings.total)}
          isHighlight
          icon="payments"
        />
        <EarningsRow
          label="This Week"
          value={formatCurrency(earnings.weekly)}
          icon="date-range"
        />
        <EarningsRow
          label="This Month"
          value={formatCurrency(earnings.monthly)}
          icon="calendar-month"
        />
        {earnings.pendingPayout > 0 && (
          <EarningsRow
            label="Pending Payout"
            value={formatCurrency(earnings.pendingPayout)}
            icon="schedule"
          />
        )}
      </View>

      <TouchableOpacity onPress={onWithdrawPress} activeOpacity={0.8}>
        <LinearGradient
          colors={['#6C63FF', '#8B5CF6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.withdrawButton}>
          <View style={styles.withdrawContent}>
            <View style={styles.withdrawIconWrapper}>
              <Icon
                name="account-balance-wallet"
                size={18}
                color={theme.colors.white}
              />
            </View>
            <AppText variant="button" color={theme.colors.white}>
              Withdraw Earnings
            </AppText>
          </View>
          <View style={styles.withdrawArrow}>
            <Icon name="arrow-forward" size={18} color={theme.colors.white} />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 18,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  titleIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  titleIconGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  todayCard: {
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 20,
  },
  todayGradient: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 22,
    position: 'relative',
    overflow: 'hidden',
  },
  todayContent: {
    flex: 1,
  },
  todayLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  todayLabel: {
    opacity: 0.9,
  },
  todayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 3,
  },
  todayAmount: {
    fontWeight: '700',
    marginBottom: 14,
    letterSpacing: 0.5,
  },
  todayStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  todayStat: {
    gap: 3,
  },
  todayStatDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  todayRight: {
    alignItems: 'flex-end',
  },
  iconCircleWrapper: {
    position: 'relative',
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardGlow1: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  cardGlow2: {
    position: 'absolute',
    bottom: -30,
    left: '20%',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  breakdown: {
    gap: 16,
    marginBottom: 20,
  },
  earningsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rowIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  highlightValue: {
    fontWeight: '700',
  },
  withdrawButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderRadius: 16,
    paddingHorizontal: 18,
  },
  withdrawContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  withdrawIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  withdrawArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
