import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AppText } from '../../../../components/common/AppText';
import { useTheme } from '../../../../hooks/useTheme';

interface EarningsSummaryCardProps {
  today: number;
  weekly: number;
  monthly: number;
  pending: number;
}

interface EarningsItemProps {
  title: string;
  amount: number;
  iconName: string;
  color: string;
  isHighlighted?: boolean;
}

const formatCurrency = (amount: number): string => {
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}k`;
  }
  return `₹${amount}`;
};

const EarningsItem: React.FC<EarningsItemProps> = ({
  title,
  amount,
  iconName,
  color,
  isHighlighted,
}) => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.earningsItem,
        {
          backgroundColor: theme.colors.primary+20
            // ? color + '15'
            // : theme.colors.surfaceSecondary,
        },
      ]}>
      <View
        style={[
          styles.iconBox,
          {
            backgroundColor: theme.colors.primary
              // ? color + '20'
              // : theme.colors.surface,
          },
        ]}>
        <Icon name={iconName} size={24} color={theme.colors.white} />
      </View>
      <AppText
        variant="caption"
        color={theme.colors.textTertiary}
        style={styles.itemTitle}>
        {title}
      </AppText>
      <AppText
        variant={isHighlighted ? 'h5' : 'body1'}
        color={isHighlighted ? color : theme.colors.text}
        style={styles.itemAmount}>
        {formatCurrency(amount)}
      </AppText>
    </View>
  );
};

export const EarningsSummaryCard: React.FC<EarningsSummaryCardProps> = ({
  today,
  weekly,
  monthly,
  pending,
}) => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
      ]}>
      {/* <View style={styles.header}>
        <AppText variant="h5" color={theme.colors.text}>
          Earnings
        </AppText>
        <View style={[styles.iconContainer,{backgroundColor:theme.colors.primary+20}]}>
          <Icon
            name="account-balance-wallet"
            size={18}
            color={theme.colors.primary}
          />
        </View>
      </View> */}
      <View style={styles.earningsGrid}>
        <EarningsItem
          title="Today"
          amount={today}
          iconName="today"
          color={theme.colors.success}
          isHighlighted
        />
        <EarningsItem
          title="This Week"
          amount={weekly}
          iconName="date-range"
          color={theme.colors.info}
        />
        <EarningsItem
          title="This Month"
          amount={monthly}
          iconName="calendar-month"
          color={theme.colors.accentPurple}
        />
        <EarningsItem
          title="Pending"
          amount={pending}
          iconName="schedule"
          color={theme.colors.warning}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    // backgroundColor: 'rgba(108, 99, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  earningsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  earningsItem: {
    width: '48%',
    padding: 8,
    borderRadius: 14,
    alignItems: 'center',
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  itemTitle: {
    marginBottom: 4,
    fontWeight: '500',
  },
  itemAmount: {
    fontWeight: '700',
  },
});
