import React from 'react';
import { FlatList, StyleSheet, View, ListRenderItem } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../../../hooks/useTheme';
import { AppText } from '../../../../components/common/AppText';
import { spacing } from '../../../../theme/spacing';
import { Transaction } from '../../domain/types';
import { TransactionItem } from './TransactionItem';

interface TransactionListProps {
  transactions: Transaction[];
  onRefresh?: () => void;
  refreshing?: boolean;
  ListHeaderComponent?: React.ReactElement;
  contentContainerStyle?: any;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onRefresh,
  refreshing,
  ListHeaderComponent,
  contentContainerStyle,
}) => {
  console.log('🔥 TransactionList Render', {
    timestamp: new Date().toISOString(),
    transactionsLength: transactions?.length,
    refreshing,
  });
  const { theme } = useTheme();

  const renderItem: ListRenderItem<Transaction> = ({ item }) => (
    <TransactionItem transaction={item} />
  );

  const keyExtractor = (item: Transaction) => (item.createdAt ?? String(Math.random()));

  const ListEmptyComponent = (
    <View style={styles.emptyContainer}>
      <Icon name="receipt-long" size={48} color={theme.colors.textTertiary} />
      <AppText
        variant="body1"
        color={theme.colors.textSecondary}
        style={styles.emptyText}>
        No transactions yet
      </AppText>
      <AppText variant="caption" color={theme.colors.textTertiary}>
        Your earnings will appear here
      </AppText>
    </View>
  );

  return (
    <FlatList
      data={transactions}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      contentContainerStyle={[styles.listContent, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={ListEmptyComponent}
      ListHeaderComponent={ListHeaderComponent}
      onRefresh={onRefresh}
      refreshing={refreshing}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: spacing.xxl,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyIcon: {
    marginBottom: spacing.sm,
  },
  emptyText: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
});
