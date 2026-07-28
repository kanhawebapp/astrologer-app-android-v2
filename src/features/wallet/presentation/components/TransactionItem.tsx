import React from 'react';
import {View, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useTheme} from '../../../../hooks/useTheme';
import {AppText} from '../../../../components/common/AppText';
import {spacing, borderRadius} from '../../../../theme/spacing';
import {Transaction} from '../../domain/types';

interface TransactionItemProps {
  transaction: Transaction;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
}) => {
  const {theme} = useTheme();

  const formatCurrency = (amount: number): string => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const formatCoins = (coins?: number): string => {
    return `${coins ?? 0} coins`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getIconName = (): string => {
    switch (transaction.icon) {
      case 'chat':
        return 'chat';
      case 'call':
        return 'call';
      case 'video':
        return 'videocam';
      case 'withdrawal':
        return 'call-made';
      case 'bonus':
        return 'card-giftcard';
      case 'refund':
        return 'replay';
      default:
        return 'account-balance-wallet';
    }
  };

  const getStatusColor = (): string => {
    switch (transaction.status) {
      case 'success':
        return theme.colors.success;
      case 'pending':
        return theme.colors.warning;
      case 'failed':
        return theme.colors.error;
      default:
        return theme.colors.textSecondary;
    }
  };

  const isCredit = transaction.type === 'credit';

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.surface}]}>
      <View
        style={[
          styles.iconContainer,
          {backgroundColor: theme.colors.primary+20},
        ]}>
        <Icon name={getIconName()} size={22} color={theme.colors.primary} />
      </View>

      <View style={styles.content}>
        <AppText variant="body1" color={theme.colors.text} style={styles.title}>
          {transaction.title}
        </AppText>
        <AppText variant="caption" color={theme.colors.textSecondary}>
          {formatDate(transaction.date)}
        </AppText>
        {transaction.description && (
          <AppText
            variant="caption"
            color={theme.colors.textTertiary}
            style={styles.description}>
            {transaction.description}
          </AppText>
        )}
      </View>

      <View style={styles.amountContainer}>
        <AppText
          variant="body1"
          color={isCredit ? theme.colors.success : theme.colors.error}
          style={styles.amount}>
          {isCredit ? '+' : '-'} {formatCoins(transaction.coins)}
        </AppText>
        <View
          style={[
            styles.statusBadge,
            {backgroundColor: getStatusColor() + '20'},
          ]}>
          <AppText variant="caption" color={getStatusColor()}>
            {transaction.status.charAt(0).toUpperCase() +
              transaction.status.slice(1)}
          </AppText>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: borderRadius.md,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  title: {
    fontWeight: '600',
    marginBottom: 2,
  },
  description: {
    marginTop: 2,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  statusBadge: {
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.xs,
  },
});
