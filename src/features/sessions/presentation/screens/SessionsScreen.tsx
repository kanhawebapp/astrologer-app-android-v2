import React, { useCallback } from 'react';
import {
  FlatList,
  StyleSheet,
  ListRenderItem,
  View,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { ScreenContainer } from '../../../../components/layout/ScreenContainer';
import { AppText } from '../../../../components/common/AppText';
import { useTheme } from '../../../../hooks/useTheme';
import { useSessions } from '../hooks/useSessions';
import { Session } from '../../domain/types';
import {
  SessionCard,
  SessionFilterTabs,
  EarningsSummaryCard,
  EmptyState,
} from '../components';
import { useNavigation } from '@react-navigation/native';

const ItemSeparator = () => <View style={styles.separator} />;

const ListHeader: React.FC<{
  activeFilter: string;
  onFilterChange: (filter: any) => void;
  activeSessionType: string;
  onSessionTypeChange: (type: any) => void;
  earningsToday: number;
  earningsWeekly: number;
  earningsMonthly: number;
  cancelledSessions: number;
  stats: any;
  theme: any
}> = ({
  activeFilter,
  onFilterChange,
  activeSessionType,
  onSessionTypeChange,
  earningsToday,
  earningsWeekly,
  earningsMonthly,
  cancelledSessions,
  stats,
  theme
}) =>

  (
    <View>
      <View style={styles.headerTitle}>
        <AppText variant="h4" style={styles.title}>
          Sessions
        </AppText>
        <View style={[styles.statsContainer, { backgroundColor: theme.colors.primary + 20 }]}>
          <AppText variant="caption" style={styles.statsText}>
            {stats.totalSessions} sessions
          </AppText>
        </View>
      </View>
      <EarningsSummaryCard
        today={earningsToday}
        weekly={earningsWeekly}
        monthly={earningsMonthly}
        cancelled={cancelledSessions}
      />
      <SessionFilterTabs
        activeFilter={activeFilter as any}
        onFilterChange={onFilterChange}
        activeSessionType={activeSessionType as any}
        onSessionTypeChange={onSessionTypeChange}
      />
    </View>

  );

export const SessionsScreen: React.FC = () => {
  const { theme } = useTheme();
  const {
    activeFilter,
    setActiveFilter,
    activeSessionType,
    setActiveSessionType,
    refreshing,
    isLoading,
    error,
    refresh,
    selectedSession,
    setSelectedSession,
    earningsToday,
    earningsWeekly,
    earningsMonthly,
    stats,
    filteredSessions,
  } = useSessions();
console.log("filteredSessionsfilteredSessionsv",filteredSessions)
  const navigation = useNavigation<any>();

  const handleSessionPress = useCallback(
    async (session: Session) => {
      setSelectedSession(session);
      navigation.navigate('SessionDetailScreen', {
        session,
      });
    },
    [setSelectedSession, navigation],
  );

  const renderItem: ListRenderItem<Session> = useCallback(
    ({ item }) => (
      <SessionCard
        session={item}
        onPress={handleSessionPress}
      />
    ),
    [handleSessionPress],
  );

  const keyExtractor = useCallback(
    (item: Session) => item.id,
    [],
  );

  const onRefresh = useCallback(async () => {
    await refresh();
  }, [refresh]);

  const renderFooter = useCallback(() => {
    if (isLoading) {
      return (
        <View style={styles.footer}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
        </View>
      );
    }
    return null;
  }, [isLoading, theme.colors.primary]);

  const listHeader = useCallback(
    () => (
      <ListHeader
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        activeSessionType={activeSessionType}
        onSessionTypeChange={setActiveSessionType}
        earningsToday={earningsToday}
        earningsWeekly={earningsWeekly}
        earningsMonthly={earningsMonthly}
        cancelledSessions={stats.cancelledSessions}
        stats={stats}
        theme={theme}
      />
    ),
    [
      activeFilter,
      setActiveFilter,
      activeSessionType,
      setActiveSessionType,
      earningsToday,
      earningsWeekly,
      earningsMonthly,
      stats,
      theme,
    ],
  );

  const renderEmpty = useCallback(() => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      );
    }
    if (error) {
      return (
        <View style={styles.errorContainer}>
          <AppText variant="body1" color={theme.colors.error}>
            {error}
          </AppText>
        </View>
      );
    }
    return <EmptyState />;
  }, [isLoading, error, theme.colors]);

  // console.log("filteredSessionsfilteredSessionsv",filteredSessions)

  return (
    <ScreenContainer scrollable={false} withPadding={false}>
      <FlatList
        data={filteredSessions}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={listHeader}
        // ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        contentContainerStyle={
          filteredSessions.length === 0 ? styles.emptyContent : styles.listContent
        }
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={ItemSeparator}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 16,
  },
  emptyContent: {
    flexGrow: 1,
  },
  separator: {
    height: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: 20,
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontWeight: '700',
  },
  statsContainer: {
    // backgroundColor: 'rgba(108, 99, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statsText: {
    color: '#6C63FF',
    fontWeight: '600',
  },
});