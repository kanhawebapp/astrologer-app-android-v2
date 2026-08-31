import {useCallback, useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {RootState, AppDispatch} from '../../../../store';
import {
  fetchWalletData,
  requestWithdrawal,
  setSelectedPeriod,
  clearWithdrawState,
  loadMoreTransactions,
} from '../../../../store/slices/walletSlice';
import {WithdrawRequest, Transaction} from '../../domain/types';

export const useWallet = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    dashboard,
    earnings,
    transactions,
    balance,
    loading,
    withdrawing,
    withdrawError,
    withdrawSuccess,
    error,
    isMockData,
    selectedPeriod,
    transactionsPage,
    transactionsTotalPages,
    transactionsTotalCount,
    loadingMoreTransactions,
    hasMoreTransactions,
  } = useSelector((state: RootState) => state.wallet);

  const loadWalletData = useCallback(() => {
    dispatch(fetchWalletData());
  }, [dispatch]);

  const handleLoadMoreTransactions = useCallback(() => {
    if (loadingMoreTransactions || loading || !hasMoreTransactions) {
      return;
    }
    dispatch(loadMoreTransactions());
  }, [dispatch, loadingMoreTransactions, loading, hasMoreTransactions]);

  useEffect(() => {
    loadWalletData();
  }, [loadWalletData]);

  const handleWithdrawal = useCallback(
    async (amount: number) => {
      const request: WithdrawRequest = {amount};
      await dispatch(requestWithdrawal(request));
    },
    [dispatch],
  );

  const handlePeriodChange = useCallback(
    (period: 'daily' | 'weekly' | 'monthly') => {
      dispatch(setSelectedPeriod(period));
    },
    [dispatch],
  );

  const clearWithdrawStatus = useCallback(() => {
    dispatch(clearWithdrawState());
  }, [dispatch]);

  const filteredTransactions = useCallback(() => {
    return transactions;
  }, [transactions]);

  const getFilteredTransactions = useCallback(
    (filter: 'all' | 'credit' | 'debit') => {
      if (filter === 'all') return transactions;
      return transactions.filter((t: Transaction) => t.type === filter);
    },
    [transactions],
  );

  const getEarningsForPeriod = useCallback(
    (period: 'daily' | 'weekly' | 'monthly') => {
      if (!earnings) return 0;
      switch (period) {
        case 'daily':
          return earnings.daily;
        case 'weekly':
          return earnings.weekly;
        case 'monthly':
          return earnings.monthly;
        default:
          return earnings.weekly;
      }
    },
    [earnings],
  );

  return {
    dashboard,
    earnings,
    transactions,
    balance,
    loading,
    withdrawing,
    withdrawError,
    withdrawSuccess,
    error,
    isMockData,
    selectedPeriod,
    transactionsPage,
    transactionsTotalPages,
    transactionsTotalCount,
    loadingMoreTransactions,
    hasMoreTransactions,
    loadWalletData,
    handleWithdrawal,
    handlePeriodChange,
    clearWithdrawStatus,
    handleLoadMoreTransactions,
    filteredTransactions,
    getFilteredTransactions,
    getEarningsForPeriod,
  };
};
