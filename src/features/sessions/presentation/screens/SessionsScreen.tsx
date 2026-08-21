import React, { useCallback, useMemo, useRef } from 'react';
import {
  FlatList,
  StyleSheet,
  ListRenderItem,
  View,
  ActivityIndicator,
  RefreshControl,
  NativeSyntheticEvent,
  NativeScrollEvent,
  StatusBar,
  Platform,
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
import { useFocusEffect, useNavigation } from '@react-navigation/native';

const ItemSeparator = () => <View style={styles.separator} />;

/** Distance from bottom (px) at which the next page should load. */
const NEAR_BOTTOM_OFFSET = 200;

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
  theme: any;
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
  theme,
}) => (
  <View>
    <View style={styles.headerTitle}>
      <AppText variant="h4" style={styles.title}>
        Sessions
      </AppText>
      <View
        style={[
          styles.statsContainer,
          { backgroundColor: theme.colors.primary + 20 },
        ]}>
        <AppText variant="caption" style={styles.statsText}>
          {stats.totalSessions} sessions
        </AppText>
      </View>
    </View>
    {/* <EarningsSummaryCard
        today={earningsToday}
        weekly={earningsWeekly}
        monthly={earningsMonthly}
        cancelled={cancelledSessions}
      /> */}
    <SessionFilterTabs
      activeFilter={activeFilter as any}
      onFilterChange={onFilterChange}
      activeSessionType={activeSessionType as any}
      onSessionTypeChange={onSessionTypeChange}
    />
  </View>
);

export const SessionsScreen: React.FC = () => {
  const { theme, mode } = useTheme();
  const {
    activeFilter,
    setActiveFilter,
    activeSessionType,
    setActiveSessionType,
    refreshing,
    isLoading,
    isLoadingMore,
    error,
    refresh,
    loadMore,
    selectedSession,
    setSelectedSession,
    earningsToday,
    earningsWeekly,
    earningsMonthly,
    stats,
    filteredSessions,
  } = useSessions();
  const navigation = useNavigation<any>();

  // Ignore FlatList's spurious initial onEndReached until the user scrolls
  const userHasScrolledRef = useRef(false);

  // Home leaves StatusBar translucent; reset on focus so first-open layout
  // settles before FlatList mounts with data.
  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle(
        mode === 'dark' ? 'light-content' : 'dark-content',
      );
      if (Platform.OS === 'android') {
        StatusBar.setTranslucent(false);
        StatusBar.setBackgroundColor(theme.colors.background);
      }
    }, [mode, theme.colors.background]),
  );

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
    ({ item, index }) => {
      // console.log('🎨 RENDER ITEM', {
      //   index,
      //   id: item.id,
      // });

      return <SessionCard session={item} onPress={handleSessionPress} />;
    },
    [handleSessionPress],
  );

  const keyExtractor = useCallback((item: Session) => item.id, []);

  const onRefresh = useCallback(async () => {
    userHasScrolledRef.current = false;
    await refresh();
  }, [refresh]);

  const handleEndReached = useCallback(() => {
    if (!userHasScrolledRef.current) {
      return;
    }
    if (isLoading || isLoadingMore || filteredSessions.length === 0) {
      return;
    }
    loadMore();
  }, [isLoading, isLoadingMore, filteredSessions.length, loadMore]);

  const handleScrollBeginDrag = useCallback(() => {
    userHasScrolledRef.current = true;
  }, []);

  // Backup when FlatList skips later onEndReached after the empty-list fire
  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, contentSize, layoutMeasurement } =
        event.nativeEvent;

      // console.log('📜 SESSION SCROLL', {
      //   offsetY: contentOffset.y,
      //   contentHeight: contentSize.height,
      //   viewportHeight: layoutMeasurement.height,
      // });

      if (!userHasScrolledRef.current) {
        return;
      }
      if (isLoading || isLoadingMore || filteredSessions.length === 0) {
        return;
      }

      const distanceFromEnd =
        contentSize.height - (layoutMeasurement.height + contentOffset.y);

      if (distanceFromEnd > NEAR_BOTTOM_OFFSET) {
        return;
      }

      loadMore();
    },
    [loadMore, isLoading, isLoadingMore, filteredSessions.length],
  );

  const renderFooter = useCallback(() => {
    if (!isLoadingMore) {
      return null;
    }
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  }, [isLoadingMore, theme.colors.primary]);

  // Depend on primitive stats fields only. `setStats` on every loadMore creates
  // a new object; remounting ListHeaderComponent breaks first-open virtualization.
  const listHeader = useMemo(
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
      stats.totalSessions,
      stats.cancelledSessions,
      theme,
    ],
  );

  console.log('📦 SESSION DATA', {
    length: filteredSessions.length,
    isLoading,
  });

  // First-open bug: FlatList was mounting empty (flexGrow content) while the
  // tab/StatusBar layout was still settling, then never virtualizing past 0–9
  // until a full remount. Mount FlatList only after the first page is ready.
  const isInitialLoading = isLoading && filteredSessions.length === 0;

  return (
    <ScreenContainer scrollable={false} withPadding={false}>
      {isInitialLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          style={styles.list}
          data={filteredSessions}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          ListHeaderComponent={listHeader}
          ListFooterComponent={renderFooter}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={ItemSeparator}
          onScrollBeginDrag={handleScrollBeginDrag}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={21}
          removeClippedSubviews={false}
          onLayout={event => {
            // console.log('📐 FLATLIST ONLAYOUT', {
            //   width: event.nativeEvent.layout.width,
            //   height: event.nativeEvent.layout.height,
            // });
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
        />
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 16,
  },
  separator: {
    height: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statsText: {
    color: '#6C63FF',
    fontWeight: '600',
  },
});
