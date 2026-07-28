import React, {useState, useCallback, useEffect, useMemo} from 'react';
import {
  View,
  StyleSheet,
  Alert,
  Animated,
  Platform,
  FlatList,
  RefreshControl,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../../../../hooks/useTheme';
import {spacing} from '../../../../theme/spacing';
import {useWallet} from '../hooks/useWallet';
import {BalanceCard} from '../components/BalanceCard';
import {WithdrawCard} from '../components/WithdrawCard';
import {FilterTabs} from '../components/FilterTabs';
import {AppText} from '../../../../components/common/AppText';
import {Transaction} from '../../domain/types';
import {TransactionItem} from '../components/TransactionItem';

type FilterType = 'all' | 'credit' | 'debit';

export const WalletScreen: React.FC = () => {
  console.log('🔥 WalletScreen Render');
  const {theme} = useTheme();
  const insets = useSafeAreaInsets();
  const {
    balance,
    earnings,
    transactions,
    loading,
    withdrawing,
    withdrawError,
    withdrawSuccess,
    isMockData,
    selectedPeriod,
    loadWalletData,
    handleWithdrawal,
    handlePeriodChange,
    clearWithdrawStatus,
    getFilteredTransactions,
    dashboard,
  } = useWallet();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [dateStart, setDateStart] = useState<Date | null>(null);
  const [dateEnd, setDateEnd] = useState<Date | null>(null);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  useEffect(() => {
    if (withdrawSuccess) {
      Alert.alert(
        'Success',
        'Your withdrawal request has been submitted successfully!',
        [{text: 'OK', onPress: clearWithdrawStatus}],
      );
    }
    if (withdrawError) {
      Alert.alert('Error', withdrawError, [
        {text: 'OK', onPress: clearWithdrawStatus},
      ]);
    }
  }, [withdrawSuccess, withdrawError, clearWithdrawStatus]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadWalletData();
    setRefreshing(false);
  }, [loadWalletData]);

  const handleWithdraw = useCallback(
    async (amount: number) => {
      await handleWithdrawal(amount);
    },
    [handleWithdrawal],
  );

  const handleDateFilterChange = useCallback(
    (startDate: Date | null, endDate: Date | null) => {
      setDateStart(startDate);
      setDateEnd(endDate);
    },
    [],
  );

  const filteredTransactions = useMemo(() => {
    let filtered = getFilteredTransactions(selectedFilter);

    if (dateStart && dateEnd) {
      filtered = filtered.filter((t: Transaction) => {
        const transDate = new Date(t.date);
        return transDate >= dateStart && transDate <= dateEnd;
      });
    }

    return filtered;
  }, [getFilteredTransactions, selectedFilter, dateStart, dateEnd]);

  const creditCount = transactions.filter(t => t.type === 'credit').length;
  const debitCount = transactions.filter(t => t.type === 'debit').length;

  const keyExtractor = useCallback(
    (item: Transaction) => item.createdAt ?? String(item.id),
    [],
  );

  const renderItem = useCallback(
    ({item}: {item: Transaction}) => <TransactionItem transaction={item} />,
    [],
  );

  const listHeaderComponent = useMemo(
    () => (
      <>
        <View style={styles.sectionHeader}>
          <AppText variant="h4" color={theme.colors.text}>
            Wallet
          </AppText>
          <AppText variant="caption" color={theme.colors.textSecondary}>
            {filteredTransactions.length} items
          </AppText>
        </View>

        {isMockData && (
          <View
            style={[
              styles.mockBadge,
              {backgroundColor: theme.colors.warningLight},
            ]}>
            <AppText variant="caption" color={theme.colors.warning}>
              Demo Mode
            </AppText>
          </View>
        )}

        <BalanceCard
          balance={balance}
          todayEarnings={earnings?.today}
          lastPayout={earnings?.lastPayout}
          onWithdrawPress={() => setShowWithdrawModal(true)}
        />

        {showWithdrawModal && (
          <WithdrawCard
            balance={balance}
            onWithdraw={handleWithdraw}
            loading={withdrawing}
          />
        )}

        <FilterTabs
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
          creditCount={creditCount}
          debitCount={debitCount}
          onDateFilterChange={handleDateFilterChange}
        />
      </>
    ),
    [
      theme.colors.text,
      theme.colors.textSecondary,
      theme.colors.warningLight,
      theme.colors.warning,
      filteredTransactions.length,
      isMockData,
      balance,
      earnings?.today,
      earnings?.lastPayout,
      showWithdrawModal,
      withdrawing,
      handleWithdraw,
      selectedFilter,
      creditCount,
      debitCount,
      handleDateFilterChange,
    ],
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView
        style={[
          styles.loadingContainer,
          {backgroundColor: theme.colors.background},
        ]}
        edges={['top']}>
        <View
          style={[styles.headerBar, {backgroundColor: theme.colors.surface}]}>
          <View style={styles.placeholder} />
          <AppText variant="h5" color={theme.colors.text}>
            Wallet
          </AppText>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.spinner}>
          <AppText variant="body2" color={theme.colors.textSecondary}>
            Loading wallet...
          </AppText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: theme.colors.background}]}
      edges={['top']}>
      <Animated.View style={styles.animatedView}>
        <FlatList
          style={styles.flatList}
          data={filteredTransactions}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={[
            styles.listContent,
            {paddingBottom: insets.bottom + spacing.lg},
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          ListHeaderComponent={listHeaderComponent}
        />
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flatList: {
    flex: 1,
  },
  animatedView: {
    flex: 1,
  },
  listContent: {
    paddingBottom: spacing.xxl,
  },
  loadingContainer: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingBottom: spacing.md,
  },
  placeholder: {
    width: 70,
  },
  spinner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mockBadge: {
    alignSelf: 'flex-start',
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
  },
});
