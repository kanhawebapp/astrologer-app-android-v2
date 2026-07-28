import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '../../../../hooks/useTheme';
import { AppText } from '../../../../components/common/AppText';
import { spacing, borderRadius } from '../../../../theme/spacing';

interface WithdrawCardProps {
  balance: number;
  onWithdraw: (amount: number) => void;
  loading?: boolean;
}

export const WithdrawCard: React.FC<WithdrawCardProps> = ({
  balance,
  onWithdraw,
  loading = false,
}) => {
  const { theme } = useTheme();
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);

  const formatCurrency = (value: string): string => {
    const numericValue = value.replace(/[^0-9]/g, '');
    if (numericValue) {
      return Number(numericValue).toLocaleString('en-IN');
    }
    return '';
  };

  const handleAmountChange = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    setAmount(numericValue);
    setError(null);
  };

  const handleMaxPress = () => {
    setAmount(balance.toString());
    setError(null);
  };

  const handleWithdraw = () => {
    const numericAmount = parseInt(amount, 10);
    if (!numericAmount || numericAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (numericAmount < 100) {
      setError('Minimum withdrawal is ₹100');
      return;
    }
    if (numericAmount > balance) {
      setError('Insufficient balance');
      return;
    }
    onWithdraw(numericAmount);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardView}>
      <View
        style={[styles.container, { backgroundColor: theme.colors.surface }]}>
        <AppText variant="h4" color={theme.colors.text} style={styles.title}>
          Withdraw Funds
        </AppText>

        <View style={styles.balanceRow}>
          <AppText variant="caption" color={theme.colors.textSecondary}>
            Available Balance
          </AppText>
          <AppText variant="body1" color={theme.colors.text}>
            ₹{balance.toLocaleString('en-IN')}
          </AppText>
        </View>

        <View style={styles.inputContainer}>
          <AppText variant="h3" color={theme.colors.textSecondary}>
            ₹
          </AppText>
          <TextInput
            style={[
              styles.input,
              {
                color: theme.colors.text,
                backgroundColor: theme.colors.surfaceSecondary,
              },
            ]}
            value={amount}
            onChangeText={handleAmountChange}
            placeholder="Enter amount"
            placeholderTextColor={theme.colors.textTertiary}
            keyboardType="numeric"
            maxLength={10}
          />
          <TouchableOpacity
            style={[
              styles.maxButton,
              { backgroundColor: theme.colors.primaryLight },
            ]}
            onPress={handleMaxPress}>
            <AppText variant="caption" color={theme.colors.white}>
              MAX
            </AppText>
          </TouchableOpacity>
        </View>

        {error && (
          <AppText
            variant="caption"
            color={theme.colors.error}
            style={styles.error}>
            {error}
          </AppText>
        )}

        <TouchableOpacity
          style={[
            styles.withdrawButton,
            {
              backgroundColor: theme.colors.primary,
              opacity: loading ? 0.6 : 1,
            },
          ]}
          onPress={handleWithdraw}
          disabled={loading}>
          <AppText variant="button" color={theme.colors.white}>
            {loading ? 'Processing...' : 'Withdraw Now'}
          </AppText>
        </TouchableOpacity>

        <AppText
          variant="caption"
          color={theme.colors.textTertiary}
          style={styles.note}>
          Minimum withdrawal: ₹100 • Processing time: 2-3 business days
        </AppText>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardView: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  container: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    marginBottom: spacing.lg,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  input: {
    flex: 1,
    fontSize: 24,
    fontWeight: '600',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
  },
  maxButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
  },
  error: {
    marginBottom: spacing.md,
  },
  withdrawButton: {
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  note: {
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
