import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Transaction} from '../../domain/types';
import {TransactionItem} from './TransactionItem';

interface TransactionListProps {
  transactions: Transaction[];
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
}) => {
  return (
    <View style={styles.container}>
      {transactions.map(item => (
        <TransactionItem
          key={item.createdAt ?? String(item.id)}
          transaction={item}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
